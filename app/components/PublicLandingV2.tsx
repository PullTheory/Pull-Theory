import Link from "next/link";

const affiliate = "https://ebay.com/inf/pulltheorytrade?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339243799&toolid=80008&mkevt=1";
const ebaySearch = (term: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(term)}&mkcid=1&mkrid=711-53200-19255-0&toolid=20023&campid=5339243819&customid=PullTheoryTrade&siteid=0&mkevt=1`;

const departments = [
  { title: "Sealed Pokémon", eyebrow: "BOXES · ETBS · BUNDLES", description: "Explore booster boxes, Elite Trainer Boxes, bundles, tins, and special collections.", href: "/sealed-products", mark: "▣", tone: "gold" },
  { title: "Single cards", eyebrow: "SINGLES · CHASE CARDS", description: "Look up a card, compare marketplace listings, and find your next collection piece.", href: "/search", mark: "◇", tone: "violet" },
  { title: "Graded & PSA slabs", eyebrow: "GRADED COLLECTIBLES", description: "Browse graded cards and slab listings from marketplace sellers.", href: ebaySearch("Pokemon PSA graded card slab"), mark: "▤", tone: "cyan" },
  { title: "Collector marketplace", eyebrow: "BUY · SELL · TRADE", description: "Discover the collector-to-collector marketplace and explore available listings.", href: "/marketplace/browse", mark: "⇄", tone: "rose" },
];

const quickLinks = [
  { title: "Build your collection", description: "Track cards and collection value.", href: "/portfolio", icon: "▦" },
  { title: "Find a card", description: "Search the card database.", href: "/search", icon: "⌕" },
  { title: "List a card", description: "Explore selling on PullTheory.", href: "/sell", icon: "＋" },
  { title: "Memberships", description: "Compare Collector, Trader, Pro & Elite.", href: "/pricing", icon: "✦" },
];

const shopTiles = [
  { title: "Booster boxes", note: "Sealed boxes from sets collectors chase.", href: ebaySearch("Pokemon TCG sealed booster box"), mark: "▦" },
  { title: "Elite Trainer Boxes", note: "Packs, accessories, and collector favorites.", href: ebaySearch("Pokemon TCG Elite Trainer Box sealed"), mark: "✦" },
  { title: "Booster bundles", note: "A pack-focused way to rip your next set.", href: ebaySearch("Pokemon TCG booster bundle sealed"), mark: "▤" },
  { title: "Collection boxes & tins", note: "Special releases, promos, and display pieces.", href: ebaySearch("Pokemon TCG collection box tin sealed"), mark: "◇" },
  { title: "Japanese & international", note: "Explore products from beyond the English releases.", href: ebaySearch("Japanese Pokemon TCG booster box sealed"), mark: "◎" },
  { title: "New releases & restocks", note: "Check marketplace listings for recent drops.", href: ebaySearch("Pokemon TCG new release restock sealed"), mark: "↗" },
];

export default function PublicLandingV2() {
  return (
    <main className="pt-home min-h-screen overflow-hidden px-4 pb-16 pt-5 text-white sm:px-6 sm:pt-8">
      <div className="pointer-events-none fixed inset-0 -z-10 pt-atmosphere" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <section className="pt-hero relative isolate overflow-hidden rounded-[2rem] border border-white/10 px-5 py-9 shadow-[0_30px_100px_rgba(0,0,0,.5)] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pt-hero-grid" aria-hidden="true" />
          <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[1.05fr_.95fr]">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200 sm:text-xs"><span className="pt-live-dot" /> Your collector destination</p>
              <h1 className="mt-6 text-[2.7rem] font-black leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-[4.5rem]">Find the cards.<span className="pt-title-glow block">Chase the feeling.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">Shop sealed Pokémon, discover singles and graded cards, explore the collector marketplace, and keep your collection moving — all in one place.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/sealed-products" className="pt-primary-btn inline-flex min-h-13 items-center justify-center rounded-xl px-7 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:-translate-y-1">Shop sealed products <span className="ml-3 text-lg" aria-hidden="true">↗</span></Link>
                <Link href="/marketplace/browse" className="inline-flex min-h-13 items-center justify-center rounded-xl border border-violet-300/35 bg-violet-300/10 px-7 py-4 text-sm font-extrabold text-violet-100 transition hover:border-violet-200/60 hover:bg-violet-300/15">Explore marketplace <span className="ml-2" aria-hidden="true">↗</span></Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-bold text-slate-400"><span>✦ Sealed product discovery</span><span>◈ Card search & collection tools</span><span>⇄ Collector marketplace</span></div>
            </div>
            <div className="pt-hero-art relative mx-auto h-[300px] w-full max-w-[500px] sm:h-[390px]" aria-label="Original abstract trading card and booster pack artwork">
              <div className="pt-orbit pt-orbit-one" /><div className="pt-orbit pt-orbit-two" />
              <div className="pt-energy energy-one">✦</div><div className="pt-energy energy-two">✧</div><div className="pt-energy energy-three">✦</div>
              <div className="pt-card pt-card-back"><div className="pt-card-art art-purple"><span>COLLECTOR</span><b>GRAIL</b><i>THE NEXT GREAT FIND</i></div></div>
              <div className="pt-card pt-card-front"><div className="pt-card-art art-gold"><span>PULL THEORY</span><b>TRADE</b><i>COLLECT · CONNECT · DISCOVER</i><div className="pt-card-sigil">✦</div></div></div>
              <div className="pt-booster"><div className="pt-booster-crimp" /><div className="pt-booster-shine" /><span className="pt-booster-small">PULL THEORY PRESENTS</span><strong>THE<br/>NEXT<br/><em>PULL.</em></strong><span className="pt-booster-edition">COLLECTOR DROP · 01</span><div className="pt-booster-orb"><span /></div></div>
              <div className="pt-art-stamp"><span>FIND YOUR</span><b>GRAIL.</b></div><div className="pt-art-caption">SEALED • SINGLES • GRADED • COMMUNITY</div>
            </div>
          </div>
          <div className="relative z-10 mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3"><span className="pt-stat-icon">01</span><div><p className="text-sm font-black">Discover</p><p className="mt-1 text-xs text-slate-400">Browse products and cards</p></div></div>
            <div className="flex items-center gap-3"><span className="pt-stat-icon">02</span><div><p className="text-sm font-black">Compare</p><p className="mt-1 text-xs text-slate-400">Review item, seller & shipping</p></div></div>
            <div className="flex items-center gap-3"><span className="pt-stat-icon">03</span><div><p className="text-sm font-black">Collect</p><p className="mt-1 text-xs text-slate-400">Track, trade, and grow your collection</p></div></div>
          </div>
        </section>

        <section className="mt-14 sm:mt-16" aria-labelledby="departments-heading">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-amber-300">Shop by department</p><h2 id="departments-heading" className="mt-3 text-3xl font-black tracking-[-.045em] sm:text-4xl">Your next chase starts <span className="text-amber-200">here.</span></h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Jump into the part of the hobby you love most.</p></div><Link href="/sealed-products" className="text-sm font-extrabold text-amber-200 transition hover:text-white">Browse all products ↗</Link></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {departments.map((item, index) => <article key={item.title} className="pt-category group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/10 p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-200/40"><div className="pt-category-glow" aria-hidden="true" /><div className="relative z-10 flex items-start justify-between"><span className="pt-category-mark" data-tone={item.tone} aria-hidden="true">{item.mark}</span><span className="pt-category-index">0{index + 1} / EXPLORE</span></div><h3 className="relative z-10 mt-7 text-xl font-black tracking-tight">{item.title}</h3><p className="relative z-10 mt-2 flex-1 text-sm leading-6 text-slate-400">{item.description}</p><Link href={item.href} className="relative z-10 mt-5 inline-flex items-center gap-2 text-sm font-black text-amber-200 transition group-hover:gap-3 group-hover:text-white">Explore department <span aria-hidden="true">↗</span></Link></article>)}
          </div>
        </section>

        <section className="mt-14 sm:mt-16" aria-labelledby="shop-heading">
          <div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[.28em] text-cyan-200">The sealed shelf</p><h2 id="shop-heading" className="mt-3 text-3xl font-black tracking-[-.045em] sm:text-4xl">Shop the <span className="text-cyan-200">rip.</span></h2><p className="mt-2 text-sm leading-6 text-slate-400">Browse marketplace listings by product type. Retailer listings, prices, availability, and shipping can change.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shopTiles.map((item) => <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer sponsored" className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#10172a]/90 p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-[#151d34]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-200/[.07] text-xl font-black text-cyan-100">{item.mark}</span><span className="min-w-0 flex-1"><span className="block font-black text-white">{item.title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{item.note}</span></span><span className="text-lg text-cyan-200 transition group-hover:translate-x-1">↗</span></a>)}</div>
          <p className="mt-3 text-[10px] leading-5 text-slate-500">Some links are affiliate links. PullTheoryTrade may earn a commission from qualifying purchases at no additional cost to you. Marketplace checkout and fulfillment are handled by the retailer.</p>
        </section>

        <section className="pt-deal-panel relative mt-14 overflow-hidden rounded-[2rem] border border-amber-200/20 p-7 sm:mt-16 sm:p-10">
          <div className="pt-deal-glow" aria-hidden="true" /><div className="relative z-10 grid items-center gap-7 lg:grid-cols-[1fr_auto]"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-amber-200">Tools for your collection</p><h2 className="mt-3 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">More than a place to shop. A home base for collectors.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Search cards, track your collection, save the cards you want, and explore ways to buy, sell, and trade with other collectors.</p></div><Link href="/signup" className="inline-flex min-h-13 items-center justify-center rounded-xl bg-amber-200 px-6 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:-translate-y-1 hover:bg-amber-100">Join PullTheory ↗</Link></div>
        </section>

        <section className="mt-14 sm:mt-16" aria-labelledby="tools-heading"><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[.28em] text-violet-200">Your collector toolkit</p><h2 id="tools-heading" className="mt-3 text-3xl font-black tracking-[-.045em] sm:text-4xl">Everything in your <span className="text-violet-200">binder.</span></h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{quickLinks.map((item) => <Link key={item.title} href={item.href} className="rounded-2xl border border-white/10 bg-[#10172a]/90 p-5 transition hover:-translate-y-1 hover:border-violet-200/35 hover:bg-[#151d34]"><span className="text-2xl text-violet-200">{item.icon}</span><h3 className="mt-4 font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p><span className="mt-4 inline-block text-sm font-black text-violet-200">Open tool ↗</span></Link>)}</div></section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          <div className="pt-info-card"><span className="text-2xl text-amber-200">✦</span><h3 className="mt-4 font-black">Built around collectors</h3><p className="mt-2 text-sm leading-6 text-slate-400">Browse product categories, search cards, and keep your collection organized.</p></div>
          <div className="pt-info-card"><span className="text-2xl text-cyan-200">◈</span><h3 className="mt-4 font-black">Compare before you buy</h3><p className="mt-2 text-sm leading-6 text-slate-400">Check the exact product, language, condition, seller feedback, and total shipping cost.</p></div>
          <div className="pt-info-card"><span className="text-2xl text-violet-200">⇄</span><h3 className="mt-4 font-black">Trade with a plan</h3><p className="mt-2 text-sm leading-6 text-slate-400">Explore PullShield information and marketplace features before making a transaction.</p><Link href="/pullshield" className="mt-4 inline-block text-sm font-black text-violet-200">Learn about PullShield ↗</Link></div>
        </section>

        <section className="mt-14 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[.035] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-amber-200">Stay in the loop</p><h2 className="mt-2 text-2xl font-black">Find your next favorite pull.</h2><p className="mt-2 text-sm text-slate-400">Follow PullTheory for collector updates, new finds, and community posts.</p></div><div className="flex flex-wrap gap-3"><Link href="/events" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Events & community</Link><Link href="/guides" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Collector guides</Link><a href={affiliate} target="_blank" rel="noopener noreferrer sponsored" className="rounded-xl bg-amber-200 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-100">eBay storefront ↗</a></div></section>

        <footer className="mt-14 border-t border-white/10 pt-8 text-center"><div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-slate-400"><Link href="/sealed-products" className="hover:text-white">Sealed Products</Link><Link href="/marketplace/browse" className="hover:text-white">Marketplace</Link><Link href="/search" className="hover:text-white">Card Search</Link><Link href="/pricing" className="hover:text-white">Memberships</Link><Link href="/guides" className="hover:text-white">Collector Guides</Link><Link href="/terms" className="hover:text-white">Terms</Link></div><p className="mt-5 text-xs text-slate-500">PullTheoryTrade · Built for the thrill of the next pull.</p><p className="mx-auto mt-4 max-w-3xl text-[10px] leading-5 text-slate-600">Affiliate disclosure: PullTheoryTrade may earn a commission from qualifying purchases made through some links, at no additional cost to you. Product availability, pricing, shipping, and checkout are controlled by the retailer and may change. Pokémon is a trademark of its respective owner. PullTheoryTrade is an independent collector platform.</p></footer>
      </div>
    </main>
  );
}
