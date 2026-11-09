import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Pokémon Collection | PullTheory",
  description: "Tell PullTheory about your Pokémon card collection and discuss possible selling options. No upfront payment or commitment required.",
};

export default function CollectionSellingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
