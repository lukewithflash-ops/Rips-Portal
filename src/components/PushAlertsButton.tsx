"use client";

import { useVip } from "@/lib/useVip";
import PushAlertsCore from "@/components/PushAlertsCore";

type Props = {
  /** Where it sits; only changes the heading copy. */
  context?: "deals" | "vip";
};

/**
 * "Get alerts" on Deals / VIP — adds the VIP gate note.
 * Never use on /open (Open never checks VIP); use AlertsNudge there.
 */
export default function PushAlertsButton({ context = "deals" }: Props) {
  const vip = useVip();
  const gated = vip.loaded && vip.gatesOn && !vip.vip;
  return <PushAlertsCore context={context} gated={gated} />;
}
