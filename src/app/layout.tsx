import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import SiteFooter from "@/components/SiteFooter";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";
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
    "Expected value for Pokémon, Topps Baseball, Basketball & One Piece packs. Free EV calculator, Verdict, Rip Log, Under-EV Watch, and pack sim — estimates, not guarantees.",
  applicationName: "Rip Portal",
  keywords: [
    "pack EV",
    "Pokémon TCG EV",
    "booster pack expected value",
    "Ascended Heroes EV",
    "30th Celebration EV",
    "Topps Chrome EV",
    "One Piece card EV",
    "Rip Portal",
  ],
  authors: [{ name: "Rip Portal" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rip Portal",
    startupImage: [
      {
        url: "/icons/splash-swirl-1024.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/splash-swirl-1024.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/splash-swirl-1024.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/splash-swirl-1024.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/splash-swirl-1024.png",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/splash-swirl-1024.png",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
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
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030306" },
    { media: "(prefers-color-scheme: light)", color: "#030306" },
  ],
  colorScheme: "dark",
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
        <OfflineBanner />
        {children}
        <SiteFooter />
        <InstallPrompt />
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
