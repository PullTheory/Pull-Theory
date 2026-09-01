import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AppHeader from "./components/AppHeader";
import TrafficTracker from "./components/TrafficTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pulltheorytrade.com"),
  title: "Pull Theory HQ",
  description: "The home for serious collectors.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  openGraph: {
    title: "Pull Theory HQ",
    description: "The home for serious collectors.",
    url: "/",
    siteName: "Pull Theory HQ",
    images: [
      {
        url: "/logo.png",
        width: 1000,
        height: 1000,
        alt: "Pull Theory HQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pull Theory HQ",
    description: "The home for serious collectors.",
    images: ["/logo.png"],
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
      <body className="min-h-full flex flex-col bg-[#050506] text-white">
        <img src="/logo.png" alt="" aria-hidden="true" className="pointer-events-none fixed left-1/2 top-1/2 z-0 h-[34rem] w-[34rem] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen sm:h-[48rem] sm:w-[48rem]" />
        <div className="relative z-10 flex min-h-full flex-col">
        <TrafficTracker />
        <AppHeader />
        {children}
        <Analytics />
        </div>
      </body>
    </html>
  );
}
