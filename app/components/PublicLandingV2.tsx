import Link from "next/link";

const paths = [
  { icon: "⌕", eyebrow: "DISCOVER", title: "Find your next card", body: "Explore collector listings, search for cards you want, and make an offer directly.", href: "/marketplace/browse", cta: "Browse marketplace" },
  { icon: "⇄", eyebrow: "TRADE", title: "Make a match", body: "Add cards you own and cards you want. Find collectors with interests that line up.", href: "/matches", cta: "Find PullMatches" },
  { icon: "＋", eyebrow: "SELL", title: "Move cards with confidence", body: "List a single card or get started with selling a larger collection.", href: "/sell", cta: "Start selling" },
];

export default function PublicLandingV2() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-6 text-white sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-sky-300/15 bg-[#0c1729] px-5 py-12 shadow-[0_28px_100px_rgba(2,8,23,.45)] sm:px-10 sm:py-16 lg:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(37,99,235,.32),transparent_42%),radial-gradient(ellipse_at_92%_90%,rgba(14,165,233,.18),transparent_38%)]" />
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-sky-200/[.07] px-4 py-2 text-[11px] font-bold uppercase tracking-[.2em] text-sky-200 sm:text-xs">Built for collectors, by collectors</p>
            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-7xl">Your next great pull <span className="text-sky-300">starts here.</span></h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">Discover cards, connect with collectors, and make your next move. Buy, sell, and trade with tools designed to make collecting feel easier.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/marketplace/browse" className="inline-flex min-h-13 items-center justify-center rounded-xl bg-sky-400 px-7 py-3.5 text-base font-extrabold text-slate-950 shadow-lg shadow-sky-950/30 transition hover:-translate-y-0.5 hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200/50">Explore marketplace <span className="ml-2" aria-hidden="true">→</span></Link>
              <Link href="/signup" className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/15 bg-white/[.06] px-7 py-3.5 text-base font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20">Create a free account</Link>
            </div>
            <p className="mt-4 text-xs text-slate-400">Free to join · You decide which offers to accept · No inventory purchase required</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-center"><p className="text-sm font-bold text-white">Discover</p><p className="mt-1 text-xs text-slate-400">Browse community listings</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-center"><p className="text-sm font-bold text-white">Connect</p><p className="mt-1 text-xs text-slate-400">Find collectors and trade matches</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-center"><p className="text-sm font-bold text-white">Collect</p><p className="mt-1 text-xs text-slate-400">Build and manage your collection</p></div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-sky-300">Make it happen</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">What brings you in today?</h2></div>
            <p className="max-w-md text-sm leading-6 text-slate-400">Start with the action you want. The important tools are never buried in a maze of menus.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {paths.map((item) => (
              <article key={item.href} className="group flex flex-col rounded-2xl border border-white/10 bg-[#101827] p-6 transition hover:-translate-y-1 hover:border-sky-300/35 hover:bg-[#132039]">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-sky-200/15 bg-sky-300/10 text-2xl text-sky-200" aria-hidden="true">{item.icon}</span>
                <p className="mt-5 text-[10px] font-extrabold tracking-[.2em] text-sky-300">{item.eyebrow}</p>
                <h3 className="mt-2 text-xl font-extrabold">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{item.body}</p>
                <Link href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-sky-200 transition group-hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">{item.cta} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-2xl border border-white/10 bg-[#101827] p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-sky-300">Collector toolkit</p>
            <h2 className="mt-3 text-2xl font-black">Your collection, all in one place.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Keep track of cards, organize your want list, discover potential trades, and show off your collection to the community.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/portfolio" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10">My collection</Link>
              <Link href="/wants" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10">Want list</Link>
              <Link href="/collector-showcase" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10">Collector showcase</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-300/15 bg-[linear-gradient(145deg,rgba(16,60,58,.45),rgba(16,24,39,.95))] p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-200">Trade with clarity</p>
            <h2 className="mt-3 text-2xl font-black">Know the process before you trade.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Learn how PullShield-supported inspection and trade steps work before you accept an offer.</p>
            <Link href="/trust" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-emerald-200 hover:text-white">Visit the Trust Center <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="mt-14 overflow-hidden rounded-2xl border border-amber-200/15 bg-[radial-gradient(ellipse_at_top_right,rgba(217,170,74,.13),transparent_50%),#111827] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-200">More ways to find your next deal</p><h2 className="mt-2 text-2xl font-black">Explore the PullTheory eBay storefront.</h2><p className="mt-2 text-sm leading-6 text-slate-400">Browse additional Pokémon cards and collectibles through our eBay storefront. Purchases there are handled by eBay and its sellers.</p><p className="mt-2 text-[11px] leading-5 text-slate-500">Some links may be affiliate links. PullTheoryTrade may earn a commission from qualifying purchases at no additional cost to you.</p></div>
            <a href="https://ebay.com/inf/pulltheorytrade?mkcid=1&amp;mkrid=711-53200-19255-0&amp;siteid=0&amp;campid=5339243799&amp;toolid=80008&amp;mkevt=1" target="_blank" rel="noopener noreferrer sponsored" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-200/25 bg-amber-200/10 px-6 py-3.5 text-sm font-extrabold text-amber-100 transition hover:bg-amber-200/15">Shop eBay storefront <span className="ml-2" aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-white/10 bg-[#0d1523] p-6 text-center sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-sky-300">Find your fit</p>
          <h2 className="mt-2 text-2xl font-black">A membership for the way you collect.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">Compare free and paid plans, included PullShield authentications, and marketplace seller fees before choosing.</p>
          <Link href="/pricing" className="mt-5 inline-flex rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold hover:bg-white/10">Compare memberships <span className="ml-2" aria-hidden="true">→</span></Link>
        </section>

        <footer className="mt-14 border-t border-white/10 pt-7 text-center">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-semibold text-slate-400">
            <Link href="/marketplace/browse" className="hover:text-white">Marketplace</Link><Link href="/sell" className="hover:text-white">Sell cards</Link><Link href="/pricing" className="hover:text-white">Memberships</Link><Link href="/events" className="hover:text-white">Community</Link><Link href="/guides" className="hover:text-white">Guides</Link><Link href="/trust" className="hover:text-white">Trust Center</Link><Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p className="mt-5 text-xs text-slate-600">PullTheoryTrade · Built for the collector community.</p>
        </footer>
      </div>
    </main>
  );
}
