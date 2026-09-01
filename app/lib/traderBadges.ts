export type TraderBadge = {
  label: string;
  description: string;
  color: string;
  verifiedTrades: number;
};

export function getTraderBadge(verifiedTrades: number): TraderBadge | null {
  if (verifiedTrades >= 100) return { label: "Verified Trader", description: "100+ authenticated trades", color: "text-amber-200 border-amber-300/35 bg-amber-300/10", verifiedTrades };
  if (verifiedTrades >= 50) return { label: "Trusted Trader", description: "50+ authenticated trades", color: "text-fuchsia-200 border-fuchsia-300/35 bg-fuchsia-300/10", verifiedTrades };
  if (verifiedTrades >= 25) return { label: "Established Trader", description: "25+ authenticated trades", color: "text-violet-200 border-violet-300/35 bg-violet-300/10", verifiedTrades };
  if (verifiedTrades >= 10) return { label: "Novice Trader", description: "10+ authenticated trades", color: "text-emerald-200 border-emerald-300/35 bg-emerald-300/10", verifiedTrades };
  return null;
}
