import Link from "next/link";

const steps = [
  { number: "01", title: "Create your free account", body: "Set up your collector profile before listing. You can browse the marketplace without paying for a membership." },
  { number: "02", title: "Photograph the card", body: "Use clear, well-lit front and back photos. Show corners, edges, surface, and any wear honestly." },
  { number: "03", title: "Set a fair asking price", body: "Compare recent sold listings for the exact card, set, number, language, and condition. Leave room for marketplace fees." },
  { number: "04", title: "Publish your listing", body: "Add the card details, price, and photos. Answer buyer questions and review offers before accepting." },
];

const fees = [
  { plan: "Collector", fee: "8%", note: "Free membership" },
  { plan: "Trader", fee: "6.5%", note: "$9.99 / month" },
  { plan: "Pro", fee: "5%", note: "$19.99 / month" },
  { plan: "Elite", fee: "3.5%", note: "$34.99 / month" },
];

export const metadata = {
  title: "Sell Pokémon Cards | PullTheory",
  description: "List Pokémon cards on PullTheory. Learn how to prepare photos, price cards, and choose the membership that fits your selling activity.",
};

export default function SellPage() {
  return (
    <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-sky-300/20 bg-[radial-gradient(circle_at_12%_0%,rgba(37,99,235,.28),transparent_42%),#101827] px-6 py-10 sm:px-12 sm:py-14">
          <p className="text-xs font-black uppercase tracking-[.22em] text-sky-300">The seller's starting point</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.05em] sm:text-6xl">Turn cards you’re ready to move into your next great pull.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">List Pokémon cards for sale or trade with a collector-focused marketplace. Start with a single card, learn what buyers are looking for, and grow at your own pace.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/marketplace/new" className="rounded-xl bg-sky-400 text-slate-950 px-6 py-4 text-center font-black shadow-lg shadow-violet-950/40 transition hover:bg-sky-300">List a Card</Link>
            <Link href="/marketplace/browse" className="rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-center font-bold transition hover:bg-white/10">Browse Marketplace</Link><Link href="/collection-selling" className="rounded-xl border border-amber-300/25 bg-amber-300/5 px-6 py-4 text-center font-bold text-amber-200 transition hover:bg-amber-300/10">Sell an Entire Collection</Link><Link href="/seller-calculator" className="rounded-xl border border-sky-300/30 px-6 py-4 text-center font-bold text-sky-200 transition hover:bg-sky-300/10">Calculate Seller Proceeds</Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">Free Collector membership available · No inventory purchase required</p>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">How to sell</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">A better listing starts before you hit publish.</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => <article key={step.number} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-sm font-black tracking-[.2em] text-sky-300">{step.number}</p>
              <h3 className="mt-4 text-lg font-black">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
            </article>)}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">Seller checklist</p>
            <h2 className="mt-3 text-2xl font-black">Help buyers feel confident.</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
              <li>• Photograph the actual card—not a stock image.</li>
              <li>• Include front and back photos in bright, even lighting.</li>
              <li>• Disclose whitening, dents, scratches, bends, and other flaws.</li>
              <li>• Match the exact set, card number, language, and finish.</li>
              <li>• Use recent sold prices for the same card and condition.</li>
              <li>• Keep shipment tracking and proof of packaging.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-sky-300/20 bg-[#101827] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-sky-300">Marketplace seller fees</p>
            <h2 className="mt-3 text-2xl font-black">Know the fee before you list.</h2>
            <div className="mt-5 space-y-3">
              {fees.map((item) => <div key={item.plan} className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div><p className="font-bold">{item.plan}</p><p className="text-xs text-zinc-400">{item.note}</p></div>
                <p className="text-xl font-black text-amber-200">{item.fee}</p>
              </div>)}
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">Fees shown are the marketplace seller fees currently displayed on PullTheory’s membership page. Review the checkout and current terms before accepting a sale.</p>
            <Link href="/pricing" className="mt-5 inline-block font-bold text-sky-200 hover:text-white">Compare memberships →</Link>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-black/30 p-7 text-center sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-sky-300">Ready when you are</p>
          <h2 className="mt-3 text-3xl font-black">Put your next card in front of collectors.</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">Start with one listing. You stay in control of your cards, your asking price, and which offers you accept.</p>
          <Link href="/marketplace/new" className="mt-6 inline-block rounded-xl bg-sky-400 text-slate-950 px-7 py-4 font-black transition hover:bg-sky-300">Start a Listing</Link>
        </section>
      </div>
    </main>
  );
}
