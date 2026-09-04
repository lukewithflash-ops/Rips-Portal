import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under-EV Deals",
  description:
    "Catalog products where market/default price sits under expected EV — positive ROI buy signals. Entertainment math, not financial advice.",
  alternates: {
    canonical: "https://ripsportal.com/deals",
  },
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
