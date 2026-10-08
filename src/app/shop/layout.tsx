import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Paste a shop’s inventory and see catalog EV per item and in total. Stored on this device only. Rip Portal.",
  alternates: { canonical: "https://www.ripsportal.com/shop" },
};

export default function ShopLayout({ children }: { children: ReactNode }) {
  return children;
}
