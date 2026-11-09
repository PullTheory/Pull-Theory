import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokémon TCG Deals & Sealed Product Watch | PullTheory",
  description: "Collector-first Pokémon TCG sealed product price checks, with exact product comparisons and transparent retailer information.",
  alternates: { canonical: "/deals" },
  openGraph: {
    title: "Pokémon TCG Deals & Sealed Product Watch | PullTheory",
    description: "Collector-first Pokémon TCG sealed product price checks and retailer comparisons.",
    url: "/deals",
    siteName: "PullTheory",
  },
};

export default function DealsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
