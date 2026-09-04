import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Pack Opener",
  description:
    "Educational pack-opening simulation with drop tables from Rip Portal EV math. No gems, no paid opens, no gambling — entertainment estimates only.",
  alternates: {
    canonical: "https://ripsportal.com/open",
  },
  openGraph: {
    title: "Free Pack Opener · Rip Portal",
    description:
      "Simulate pack opens with catalog drop tables. Math estimates only — not official odds, not financial advice.",
    url: "https://ripsportal.com/open",
    siteName: "Rip Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Pack Opener · Rip Portal",
    description:
      "Educational pack sim with EV-model drop tables. No paid opens, no gambling.",
  },
};

export default function OpenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
