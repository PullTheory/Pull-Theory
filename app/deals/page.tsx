import Link from "next/link";
import type { Metadata } from "next";

const storeUrl = "https://ebay.com/inf/pulltheorytrade?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339243799&toolid=80008&mkevt=1";

export const metadata: Metadata = {
  title: "Pokémon TCG Deals Today | Sealed, Singles & PSA Slabs | PullTheoryTrade",
  description: "Compare Pokémon TCG deals by exact set, card number, language, variant, condition, grade, seller and shipping. Collector-first price checks from PullTheoryTrade.",
  alternates: { canonical: "/deals" },
  openGraph: {
    title: "Pokémon TCG Deals Today | PullTheoryTrade",
    description: "Collector-first checks on sealed Pokémon products, singles and graded cards. Compare exact matches and delivered prices before you buy.",
    url: "/deals",
    siteName: "PullTheoryTrade",
  },
};

const sections = [
  {
    number: "01",
    title: "Sealed Pokémon products",
    description: "Booster boxes, Elite Trainer Boxes, booster bundles, collection boxes, tins and special releases. Compare the exact product, pack count, language and sealed condition.",
    href: "/sealed-products",
    link: "Browse sealed products",
  },
  {
    number: "02",
    title: "Individual Pokémon cards",
    description: "Match the set, collector number, language, rarity, finish and variant. A standard holo, reverse holo, illustration rare and promo are not interchangeable comps.",
    href: "/search",
    link: "Search Pokémon cards",
  },
  {
    number: "03",
    title: "PSA and graded cards",
    description: "Compare the same card and printing at the same grading company and grade. PSA 9 is not a like-for-like comparison with PSA 10, and slab condition still matters.",
    href: "/search",
    link: "Find a card to compare",
  },
];

const checks = [
  ["Exact match", "Same product or card number, set, language, variant and edition."],
  ["Condition and grade", "Sealed means factory sealed; raw cards need a clear condition; slabs need the same grader and grade."],
  ["Delivered price", "Item price plus stated shipping. Taxes are shown separately when the seller or marketplace calculates them at checkout."],
  ["Real comparison", "Use recent completed sales or a clearly labelled market reference—not another seller’s asking price alone."],
  ["Seller and listing", "Check seller feedback, photos, quantity, availability, handling time, returns and listing details."],
];

export default function DealsPage() {
  return (
    <main className="min-h-screen bg-[#080b16] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-amber-200">Home</Link><span className="mx-2">/</span><span className="text-slate-200">Verified Pokémon TCG Deals</span>
        </nav>

        <section className="mt-7 overflow-hidden rounded-[2rem] border border-amber-200/15 bg-[radial-gradient(ellipse_at_85%_10%,rgba(124,58,237,.22),transparent_42%),linear-gradient(120deg,#15182b,#101827_60%,#111827)] p-7 sm:p-11">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.22em] text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Collector-first price checks
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl">
            Pokémon TCG deals.<span className="block text-amber-200">Checked, not guessed.</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Find sealed products, individual cards and graded Pokémon slabs worth a closer look. We focus on exact matches, live listing details and the price you actually pay before tax—not hype or unrealistic profit promises.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-200 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-100">Visit PullTheoryTrade on eBay ↗</a>
            <Link href="/sealed-products" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[.06] px-6 py-3 text-sm font-bold text-white hover:bg-white/10">Browse product categories</Link>
          </div>
        </section>

        <section className="mt-9 rounded-2xl border border-white/10 bg-[#101827] p-6 sm:p-8" aria-labelledby="daily-status">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-200">Daily deal board</p>
              <h2 id="daily-status" className="mt-2 text-2xl font-black">No offers published as verified today</h2>
            </div>
            <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1.5 text-xs font-bold text-amber-100">Verification-first</span>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
            We only label an item a deal after checking its live underlying listing, seller, condition, availability, shipping and a genuinely comparable market reference. If those checks are incomplete—or no listing stands out—we say so instead of filling this page with guesses.
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            This board is a curated editorial update, not a live inventory feed. Prices and stock can change at any time. Always confirm the final checkout total and listing terms with the seller.
          </p>
        </section>

        <section className="mt-14" aria-labelledby="coverage">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-violet-200">What we check</p>
          <h2 id="coverage" className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Three ways to find your next pull.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {sections.map((section) => (
              <article key={section.number} className="flex min-h-[250px] flex-col rounded-2xl border border-white/10 bg-[#111c2d] p-6 transition hover:border-amber-200/35">
                <span className="text-xs font-black tracking-[.18em] text-amber-200">{section.number} / PULLTHEORY</span>
                <h3 className="mt-5 text-xl font-black">{section.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{section.description}</p>
                <Link href={section.href} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-amber-200 hover:text-white">{section.link} <span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[#101827] p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-200">Our deal checklist</p>
            <h2 className="mt-3 text-2xl font-black">How we decide if it’s actually a deal</h2>
            <ol className="mt-6 space-y-5">
              {checks.map(([title, description], index) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-200/10 text-xs font-black text-cyan-100">{index + 1}</span>
                  <div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="rounded-2xl border border-amber-200/15 bg-[linear-gradient(145deg,#211c1b,#111827)] p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-200">Price math that matters</p>
            <h2 className="mt-3 text-2xl font-black">Compare the delivered price.</h2>
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
              <div className="flex justify-between gap-3 text-sm"><span className="text-slate-400">Item price</span><strong>$40.00</strong></div>
              <div className="mt-3 flex justify-between gap-3 text-sm"><span className="text-slate-400">Stated shipping</span><strong>$5.00</strong></div>
              <div className="my-4 border-t border-white/10" />
              <div className="flex justify-between gap-3"><span className="font-bold">Total before tax</span><strong className="text-xl text-amber-200">$45.00</strong></div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Illustrative example only. Taxes, if applicable, are additional and depend on checkout.</p>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">A listing can look cheap until shipping is added. We show the item price and stated shipping separately so the comparison stays transparent.</p>
            <Link href="/guides" className="mt-5 inline-flex font-bold text-amber-200 hover:text-white">Read collector guides ↗</Link>
          </aside>
        </section>

        <section className="mt-14 rounded-2xl border border-violet-200/15 bg-violet-300/[.06] p-6 sm:p-8">
          <h2 className="text-2xl font-black">Keep your next Pokémon purchase collector-smart.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Browse marketplace listings, compare exact variants and review seller details before you buy. PullTheoryTrade may earn a commission from qualifying purchases through affiliate links, at no additional cost to you.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-200 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-100">Shop the eBay storefront ↗</a>
            <Link href="/guides" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold hover:bg-white/10">Learn before you buy</Link>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs leading-5 text-slate-500">
          PullTheoryTrade does not own or stock third-party marketplace products. Asking prices are not verified market values, and collectibles can lose value. No resale profit is guaranteed. Verify the listing and all checkout charges before purchasing.
        </footer>
      </div>
    </main>
  );
}
