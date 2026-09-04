import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://ripsportal.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rip Portal — Pack EV Calculator",
    template: "%s · Rip Portal",
  },
  description:
    "Expected value for Pokémon, Topps Baseball, Basketball & One Piece packs. Free EV calculator, Verdict, Rip Log, Deals, and pack sim — estimates, not guarantees.",
  applicationName: "Rip Portal",
  keywords: [
    "pack EV",
    "Pokémon TCG EV",
    "booster pack expected value",
    "Topps Chrome EV",
    "One Piece card EV",
    "Rip Portal",
  ],
  authors: [{ name: "Rip Portal" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Rip Portal",
    title: "Rip Portal — Pack EV Calculator",
    description:
      "Calculate pack expected value for Pokémon, sports cards, and One Piece. Multiverse-approved math for collectors.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rip Portal — Pack EV Calculator",
    description:
      "Know before you rip. Pack EV for Pokémon, sports, and One Piece.",
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col portal-bg">
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
