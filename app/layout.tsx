import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AppHeader from "./components/AppHeader";
import TrafficTracker from "./components/TrafficTracker";
import SiteFooter from "./components/SiteFooter";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://pulltheorytrade.com"),
  title: "PullTheoryTrade | Shop, Collect, Buy, Sell & Trade",
  description: "Shop sealed Pokémon products, discover singles and graded cards, explore the collector marketplace, and manage your collection with PullTheoryTrade.",
  icons: { icon: [{ url: "/logo.png", type: "image/png" }], apple: [{ url: "/logo.png", type: "image/png" }] },
  openGraph: {
    title: "PullTheoryTrade | Shop, Collect, Buy, Sell & Trade",
    description: "Discover sealed products, singles, graded cards, and collector tools at PullTheoryTrade.",
    url: "/",
    siteName: "PullTheoryTrade",
    images: [{ url: "/logo.png", width: 1000, height: 1000, alt: "PullTheoryTrade" }],
  },
  twitter: { card: "summary_large_image", title: "PullTheoryTrade | Pokémon Sealed Product Deals", description: "Discover sealed Pokémon products and compare current retailer listings with PullTheoryTrade.", images: ["/logo.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full overflow-x-hidden bg-[#080f1c] text-white">
        <div className="relative z-10 flex min-h-screen flex-col">
          <TrafficTracker />
          <AppHeader />
          {children}
          <SiteFooter />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
