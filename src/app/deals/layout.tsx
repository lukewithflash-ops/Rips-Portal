import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under-EV Deals",
  description:
    "Catalog products where market/default price sits under expected EV — positive ROI buy signals. Entertainment math, not financial advice.",
  alternates: {
    canonical: "https://ripsportal.com/deals",
  },
  openGraph: {
    title: "Under-EV Deals · Rip Portal",
    description:
      "Buy signals where catalog price sits under modeled EV. Multi-hobby — entertainment math only.",
    url: "https://ripsportal.com/deals",
    siteName: "Rip Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Under-EV Deals · Rip Portal",
    description:
      "Price under EV watchlist for Pokémon, sports, and One Piece sealed.",
  },
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
