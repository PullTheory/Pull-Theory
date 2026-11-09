import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokémon Seller Fee Calculator | PullTheory",
  description: "Estimate your PullTheory Pokémon card sale proceeds after marketplace fees and shipping.",
};

export default function SellerCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
