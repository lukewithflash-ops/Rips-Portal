import { removeSubscriberByToken } from "@/lib/underEvEmail";

export const runtime = "nodejs";

function page(title: string, body: string): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} · Rip Portal</title>
</head>
<body style="margin:0;background:#050508;color:#e2e8f0;font-family:system-ui,sans-serif">
  <main style="max-width:32rem;margin:4rem auto;padding:0 1.25rem">
    <p style="color:#4ade80;font-weight:700;letter-spacing:.04em">Rip Portal</p>
    <h1 style="font-size:1.5rem;margin:0.5rem 0 1rem">${title}</h1>
    <p style="line-height:1.5;color:#cbd5e1">${body}</p>
    <p><a href="https://www.ripsportal.com/deals" style="color:#6ee7b7">Back to Under-EV Watch</a></p>
  </main>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim() || "";
  if (!token) {
    return page(
      "Missing link",
      "This unsubscribe link is missing its token. Use the link from the email."
    );
  }
  try {
    const removed = await removeSubscriberByToken(token);
    if (!removed) {
      return page(
        "Already unsubscribed",
        "That address is not on the Under-EV flip list. No further emails will be sent for this link."
      );
    }
    return page(
      "Unsubscribed",
      "You will not get Under-EV flip emails from Rip Portal. The calculator and Under-EV Watch stay free."
    );
  } catch {
    return page(
      "Could not unsubscribe",
      "The list is unavailable right now. Try the link again in a few minutes."
    );
  }
}
