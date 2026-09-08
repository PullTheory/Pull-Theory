export const paidPlans = {
  trader: { name: "Trader", credits: 4, priceEnv: "STRIPE_PRICE_TRADER" },
  pro: { name: "Pro", credits: 8, priceEnv: "STRIPE_PRICE_PRO" },
  elite: { name: "Elite", credits: 15, priceEnv: "STRIPE_PRICE_ELITE" },
} as const;

export type PaidPlan = keyof typeof paidPlans;

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === "string" && value in paidPlans;
}
