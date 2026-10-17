/**
 * Apple Push Notification service (native iPhone app alerts).
 *
 * Off until all four are set on Vercel (values never logged or returned):
 *   APNS_KEY_ID      10-char Key ID of the APNs auth key (.p8)
 *   APNS_TEAM_ID     10-char Apple Developer Team ID
 *   APNS_KEY_P8      full contents of AuthKey_XXXXXXXXXX.p8 (BEGIN/END lines included;
 *                    literal "\n" sequences are accepted)
 *   APNS_BUNDLE_ID   com.ripsportal.app
 * Optional:
 *   APNS_SANDBOX=1   send to the sandbox gateway (Xcode debug builds only;
 *                    TestFlight and App Store builds use production)
 */
import { connect, constants, type ClientHttp2Session } from "node:http2";
import { createPrivateKey, sign } from "node:crypto";
import type { PushPayload } from "@/lib/webPushServer";

export function apnsConfigured(): boolean {
  return Boolean(
    process.env.APNS_KEY_ID &&
      process.env.APNS_TEAM_ID &&
      process.env.APNS_KEY_P8 &&
      process.env.APNS_BUNDLE_ID
  );
}

/** Names only — never values. */
export function missingApnsEnv(): string[] {
  return ["APNS_KEY_ID", "APNS_TEAM_ID", "APNS_KEY_P8", "APNS_BUNDLE_ID"].filter(
    (k) => !process.env[k]
  );
}

function host(): string {
  return process.env.APNS_SANDBOX === "1"
    ? "https://api.sandbox.push.apple.com"
    : "https://api.push.apple.com";
}

let cachedJwt: { token: string; at: number } | null = null;

/** Provider token (ES256 JWT). Apple accepts one for up to 60 min; refresh at 50. */
function providerToken(): string {
  const now = Math.floor(Date.now() / 1000);
  if (cachedJwt && now - cachedJwt.at < 50 * 60) return cachedJwt.token;
  const pem = (process.env.APNS_KEY_P8 || "").replace(/\\n/g, "\n").trim();
  const key = createPrivateKey(pem);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = b64({ alg: "ES256", kid: process.env.APNS_KEY_ID });
  const body = b64({ iss: process.env.APNS_TEAM_ID, iat: now });
  const sig = sign("sha256", Buffer.from(`${head}.${body}`), {
    key,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  cachedJwt = { token: `${head}.${body}.${sig}`, at: now };
  return cachedJwt.token;
}

export type ApnsResult = { ok: boolean; gone: boolean; status: number; reason?: string };

function sendOne(
  session: ClientHttp2Session,
  deviceToken: string,
  payload: PushPayload
): Promise<ApnsResult> {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      aps: {
        alert: { title: payload.title, body: payload.body },
        sound: "default",
        "thread-id": payload.tag || "rip-portal",
      },
      url: payload.url || "/deals",
    });
    let status = 0;
    let data = "";
    const req = session.request({
      [constants.HTTP2_HEADER_METHOD]: "POST",
      [constants.HTTP2_HEADER_PATH]: `/3/device/${deviceToken}`,
      authorization: `bearer ${providerToken()}`,
      "apns-topic": process.env.APNS_BUNDLE_ID as string,
      "apns-push-type": "alert",
      "apns-priority": "10",
      ...(payload.tag ? { "apns-collapse-id": payload.tag.slice(0, 64) } : {}),
      "content-type": "application/json",
    });
    req.setTimeout(10_000, () => {
      req.close();
      resolve({ ok: false, gone: false, status: 0, reason: "timeout" });
    });
    req.on("response", (h) => {
      status = Number(h[constants.HTTP2_HEADER_STATUS] || 0);
    });
    req.setEncoding("utf8");
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      let reason: string | undefined;
      try {
        reason = data ? (JSON.parse(data) as { reason?: string }).reason : undefined;
      } catch {
        /* ignore */
      }
      const gone =
        status === 410 ||
        (status === 400 && (reason === "BadDeviceToken" || reason === "DeviceTokenNotForTopic"));
      resolve({ ok: status === 200, gone, status, reason });
    });
    req.on("error", () => resolve({ ok: false, gone: false, status: 0, reason: "stream_error" }));
    req.end(body);
  });
}

/** Send one alert to many device tokens over a single HTTP/2 connection. */
export async function sendApns(
  tokens: string[],
  payload: PushPayload
): Promise<Map<string, ApnsResult>> {
  const out = new Map<string, ApnsResult>();
  if (!apnsConfigured() || !tokens.length) return out;
  const session = connect(host());
  session.on("error", () => undefined);
  try {
    for (const t of tokens) out.set(t, await sendOne(session, t, payload));
  } finally {
    session.close();
  }
  return out;
}
