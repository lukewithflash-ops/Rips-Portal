import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rip Log",
  description:
    "Log a rip session and compare actual pulls to expected EV. Personal math notebook — not investment advice.",
  alternates: {
    canonical: "https://ripsportal.com/log",
  },
};

export default function LogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
