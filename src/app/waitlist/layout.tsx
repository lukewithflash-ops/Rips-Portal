import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Waitlist",
  description:
    "Join the Portal waitlist — Rip tools today, more Portal products as we expand. Free interest list for collectors.",
  alternates: {
    canonical: "https://ripsportal.com/waitlist",
  },
  openGraph: {
    title: "Portal Waitlist · Rip Portal",
    description:
      "Rip tools → more Portal products. Join the interest list for Portal LLC expansion.",
    url: "https://ripsportal.com/waitlist",
    siteName: "Rip Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Waitlist · Rip Portal",
    description:
      "Join the Portal interest list — collectors who want more than pack EV.",
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
