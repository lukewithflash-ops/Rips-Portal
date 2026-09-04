import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rip Log",
  description:
    "Log a rip session and compare actual pulls to expected EV. Personal math notebook — not investment advice.",
  alternates: {
    canonical: "https://ripsportal.com/log",
  },
  openGraph: {
    title: "Rip Log · Rip Portal",
    description:
      "Log pulls and compare to expected EV. Share a session link — entertainment math only.",
    url: "https://ripsportal.com/log",
    siteName: "Rip Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rip Log · Rip Portal",
    description:
      "Session vs expected EV notebook for multi-hobby collectors.",
  },
};

export default function LogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
