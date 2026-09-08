import MembershipCheckoutButton from "../components/MembershipCheckoutButton";
import type { PaidPlan } from "../lib/stripePlans";

const plans = [
  {
    name: "Collector",
    price: "$0",
    cadence: "Free forever",
    credits: "0 PullShield authentications included",
    extra: "$9.99 per additional authentication",
    sellerFee: "8% marketplace seller fee",
    features: [
      "Track up to 250 cards",
      "Portfolio value",
      "Browse, buy, sell, or trade",
      "PullShield-protected marketplace access",
    ],
    href: "/signup",
    action: "Start collecting",
    featured: false,
  },
  {
    name: "Trader",
    plan: "trader",
    price: "$9.99",
    cadence: "per month",
    credits: "1 PullShield authentication included",
    extra: "$7.99 per additional authentication",
    sellerFee: "6.5% marketplace seller fee",
    features: [
      "PullMatch access",
      "Reduced authentication fees",
      "Lower seller fees",
      "Buy, sell, or trade with PullShield protection",
    ],
    action: "Become a Trader",
    featured: false,
  },
  {
    name: "Pro",
    plan: "pro",
    price: "$19.99",
    cadence: "per month",
    credits: "3 PullShield authentications included",
    extra: "$5.99 per additional authentication",
    sellerFee: "5% marketplace seller fee",
    features: [
      "Everything in Trader",
      "Enhanced TheoryScore",
      "Advanced portfolio analytics",
      "Lower marketplace seller fees",
    ],
    action: "Go Pro",
    featured: true,
  },
  {
    name: "Elite",
    plan: "elite",
    price: "$34.99",
    cadence: "per month",
    credits: "7 PullShield authentications included",
    extra: "$4.99 per additional authentication",
    sellerFee: "3.5% marketplace seller fee",
    features: [
      "Everything in Pro",
      "Priority PullShield handling",
      "Lowest seller fees",
      "Elite collector support",
    ],
    action: "Choose Elite",
    featured: false,
  },
] as const;

export default function PricingPage() {
  return (
    <main className="min-h-screen px-6 py-16 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Pull Theory memberships
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Buy. Sell. Trade. Pay less as you collect more.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            Choose the membership that fits how you collect. Save on PullShield
            authentication and marketplace seller fees while buying, selling,
            and trading with protection built in.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-7 backdrop-blur ${
                plan.featured
                  ? "border-violet-300/60 bg-violet-500/[0.14] shadow-[0_24px_80px_rgba(124,58,237,0.26)]"
                  : "border-white/10 bg-black/30"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-4 py-1 text-xs font-bold uppercase tracking-wider">
                  Most popular
                </span>
              )}

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                {plan.name}
              </p>

              <p className="mt-6 text-4xl font-semibold">{plan.price}</p>
              <p className="mt-2 text-sm text-zinc-400">{plan.cadence}</p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-semibold text-white">
                  {plan.credits}
                </p>
                <p className="mt-3 text-xs leading-5 text-violet-200">
                  {plan.extra}
                </p>
                <p className="mt-3 text-xs font-semibold leading-5 text-emerald-200">
                  {plan.sellerFee}
                </p>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="text-emerald-300">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {"plan" in plan ? (
                <MembershipCheckoutButton
                  plan={plan.plan as PaidPlan}
                  featured={plan.featured}
                >
                  {plan.action}
                </MembershipCheckoutButton>
              ) : (
                <a
                  href={plan.href}
                  className="mt-8 block rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold transition hover:border-violet-300/60 hover:bg-white/[0.06]"
                >
                  {plan.action}
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-7 text-sm leading-7 text-zinc-300">
          <p className="font-semibold uppercase tracking-[0.16em] text-amber-300">
            PullShield protection for every kind of collector
          </p>
          <p className="mt-3">
            Memberships lower your authentication costs and seller fees.
            Buyers can purchase cards, sellers can list cards for sale, and
            collectors can still trade card-for-card. PullShield verifies cards
            before marketplace transactions are completed.
          </p>
          <a
            href="/terms"
            className="mt-4 inline-block font-semibold text-violet-200 transition hover:text-white"
          >
            Read PullShield terms →
          </a>
        </div>
      </section>
    </main>
  );
}