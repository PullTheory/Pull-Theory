export const paidPlans = {
  trader: { name: "Trader", credits: 4, priceEnv: "STRIPE_PRICE_TRADER", priceCents: 999 },
  pro: { name: "Pro", credits: 8, priceEnv: "STRIPE_PRICE_PRO", priceCents: 1999 },
  elite: { name: "Elite", credits: 15, priceEnv: "STRIPE_PRICE_ELITE", priceCents: 3499 },
} as const;

export type PaidPlan = keyof typeof paidPlans;

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === "string" && value in paidPlans;
}
