/**
 * VIP ↔ Under-EV flip email glue (reuses src/lib/underEvEmail.ts).
 * When VIP turns on for an email, make sure that address is on the flip-email
 * list with the "deals" interest. Unsubscribe links in each email still work.
 * Flip emails are filtered to VIP accounts in runUnderEvFlipEmails().
 */
import { listSubscribers, saveWaitlistSubscriber } from "@/lib/underEvEmail";

export async function onVipActivated(email: string): Promise<void> {
  try {
    const existing = (await listSubscribers()).find((s) => s.email === email);
    if (existing?.interests.includes("deals")) return;
    await saveWaitlistSubscriber(email, [...(existing?.interests ?? []), "deals"]);
  } catch {
    /* flip list is best-effort; VIP flag is already saved */
  }
}
