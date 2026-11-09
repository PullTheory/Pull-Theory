"use client";

import Link from "next/link";

const standards = [
  { title: "Exact-match comparisons", body: "Same Pokémon set, product type, language, edition, and pack count—never compare unlike products." },
  { title: "Real delivered cost", body: "We show listed price plus stated shipping. Taxes are left out because they vary by location and checkout." },
  { title: "Seller quality first", body: "We prioritize established retailers and clearly identify marketplace sellers when a listing comes from a third party." },
  { title: "No fake discounts", body: "A product only earns a deal label when its current price can be checked against a meaningful comparison." },
];

export default function DealsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-violet-300/20 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,.28),transparent_35%),linear-gradient(135deg,#171022,#09090d_65%)] p-7 shadow-2xl sm:p-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-violet-300">PullTheory • Sealed product watch</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Find the pack.<br /><span className="text-violet-300">Skip the bad price.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">A collector-first place to spot worthwhile Pokémon TCG sealed-product prices, from booster boxes and ETBs to bundles and collection boxes.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/marketplace/browse" className="rounded-full bg-violet-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-400">Browse the marketplace</Link>
            <Link href="/guides" className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-zinc-100 transition hover:bg-white/5">Collector guides</Link>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-wider text-amber-200">Deal feed setup in progress</p>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">We are preparing retailer partnerships and verification checks. No product is being advertised here as an active deal yet, and there are no affiliate links on this page today. We will only publish listings after their exact product, current price, shipping, stock status, and seller are checked.</p>
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">How PullTheory checks a deal</p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Collector standards, not clickbait.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {standards.map((item, index) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-xs font-bold text-violet-300">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 bg-[#101015] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">What we plan to track</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Booster boxes", "Elite Trainer Boxes", "Booster bundles", "Collection boxes", "Special sets", "Singles & graded cards"].map((item) => <span key={item} className="rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-3 py-2 text-sm text-violet-100">{item}</span>)}
        </div>
        <p className="mt-5 text-sm leading-6 text-zinc-400">When retailer partnerships are active, qualifying links will be clearly identified near the product. PullTheory may earn a commission from purchases made through those links, at no additional cost to the buyer. Retailers control their own prices, availability, shipping, and checkout.</p>
      </section>
    </main>
  );
}
