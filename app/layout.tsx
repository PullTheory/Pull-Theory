import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AppHeader from "./components/AppHeader";
import TrafficTracker from "./components/TrafficTracker";
import InstallAppPrompt from "./components/InstallAppPrompt";

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
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  applicationName: "Pull Theory",
  appleWebApp: {
    capable: true,
    title: "Pull Theory",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
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

export const viewport: Viewport = {
  themeColor: "#050506",
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
      <body className="min-h-full flex flex-col bg-[#050506] text-white">
        <img src="/logo.png" alt="" aria-hidden="true" className="pointer-events-none fixed left-1/2 top-1/2 z-0 h-[34rem] w-[34rem] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen sm:h-[48rem] sm:w-[48rem]" />
        <div className="relative z-10 flex min-h-full flex-col">
        <TrafficTracker />
        <AppHeader />
        {children}
        <InstallAppPrompt />
        <Analytics />
        </div>
      </body>
    </html>
  );
}
