import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AppHeader from "./components/AppHeader";
import TrafficTracker from "./components/TrafficTracker";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://pulltheorytrade.com"),
  title: "Pull Theory HQ",
  description: "The home for serious collectors.",
  icons: { icon: [{ url: "/logo.png", type: "image/png" }], apple: [{ url: "/logo.png", type: "image/png" }] },
  openGraph: {
    title: "Pull Theory HQ",
    description: "The home for serious collectors.",
    url: "/",
    siteName: "Pull Theory HQ",
    images: [{ url: "/logo.png", width: 1000, height: 1000, alt: "Pull Theory HQ" }],
  },
  twitter: { card: "summary_large_image", title: "Pull Theory HQ", description: "The home for serious collectors.", images: ["/logo.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full overflow-x-hidden bg-[#050506] text-white">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <img
            src="/logo.png"
            alt=""
            className="absolute left-1/2 top-1/2 h-auto w-[22rem] max-w-[82vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.08] sm:w-[30rem]"
          />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
          <TrafficTracker />
          <AppHeader />
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
