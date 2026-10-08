import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP data plan",
  description:
    "Rip Portal VIP: under-EV flip emails, the full Under-EV list, Rip Log export, and set price history. $5/month or $40/year. The calculator and Open stay free.",
  alternates: { canonical: "https://www.ripsportal.com/vip" },
  openGraph: {
    title: "Rip Portal VIP — data plan",
    description:
      "Flip emails, full Under-EV list, Rip Log export, and price history. $5/month or $40/year.",
    url: "https://www.ripsportal.com/vip",
    siteName: "Rip Portal",
    type: "website",
  },
};

export default function VipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
