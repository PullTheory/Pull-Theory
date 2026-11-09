import Link from "next/link";

const storeUrl = "https://ebay.com/inf/pulltheorytrade?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339243799&toolid=80008&mkevt=1";

const categories = [
  { name: "Booster Boxes", url: "https://www.ebay.com/sch/i.html?_nkw=pokemon+tcg+booster+box+sealed&mkcid=1&mkrid=711-53200-19255-0&toolid=20023&campid=5339243819&customid=PullTheoryTrade&siteid=0&mkevt=1", detail: "Big pack energy. Explore sealed boxes from the sets collectors are chasing.", mark: "▦", tag: "THE BIG HITS", tone: "violet" },
  { name: "Elite Trainer Boxes", url: "https://www.ebay.com/sch/i.html?_nkw=pokemon+tcg+elite+trainer+box+sealed&mkcid=1&mkrid=711-53200-19255-0&toolid=20023&campid=5339243819&customid=PullTheoryTrade&siteid=0&mkevt=1", detail: "Packs, accessories, and collector-worthy presentation in one box.", mark: "✦", tag: "COLLECTOR PICKS", tone: "amber" },
  { name: "Booster Bundles", url: "https://www.ebay.com/sch/i.html?_nkw=pokemon+tcg+booster+bundle+sealed&mkcid=1&mkrid=711-53200-19255-0&toolid=20023&campid=5339243819&customid=PullTheoryTrade&siteid=0&mkevt=1", detail: "A compact way to chase the next great pull. Just packs, no extras.", mark: "▤", tag: "PACK HUNT", tone: "cyan" },
  { name: "Collection Boxes", url: "https://www.ebay.com/sch/i.html?_nkw=pokemon+tcg+collection+box+sealed&mkcid=1&mkrid=711-53200-19255-0&toolid=20023&campid=5339243819&customid=PullTheoryTrade&siteid=0&mkevt=1", detail: "Special releases, promo cards, and display-worthy sealed finds.", mark: "◇", tag: "SPECIAL RELEASES", tone: "rose" },
  { name: "Tins & Special Sets", url: "https://www.ebay.com/sch/i.html?_nkw=pokemon+tcg+premium+collection+tin+sealed&mkcid=1&mkrid=711-53200-19255-0&toolid=20023&campid=5339243819&customid=PullTheoryTrade&siteid=0&mkevt=1", detail: "Dig into premium collections, tins, and unique sealed formats.", mark: "⬡", tag: "RARE FINDS", tone: "emerald" },
  { name: "New Releases & Restocks", url: "https://www.ebay.com/sch/i.html?_nkw=pokemon+tcg+new+release+restock+sealed&mkcid=1&mkrid=711-53200-19255-0&toolid=20023&campid=5339243819&customid=PullTheoryTrade&siteid=0&mkevt=1", detail: "Keep your radar on for fresh drops and products returning to shelves.", mark: "↗", tag: "FRESH DROPS", tone: "blue" },
];

export default function PublicLandingV2() {
  return (
    <main className="pt-home min-h-screen overflow-hidden px-4 pb-16 pt-5 text-white sm:px-6 sm:pt-8">
      <div className="pointer-events-none fixed inset-0 -z-10 pt-atmosphere" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <section className="pt-hero relative isolate overflow-hidden rounded-[2rem] border border-white/10 px-5 py-10 shadow-[0_30px_100px_rgba(0,0,0,.5)] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="pt-hero-grid" aria-hidden="true" />
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-5">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200 sm:text-xs">
                <span className="pt-live-dot" /> The collector's hunt starts here
              </p>
              <h1 className="mt-6 text-[2.7rem] font-black leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-[4.6rem]">
                Chase the
                <span className="pt-title-glow block">next big pull.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Your spot for Pokémon TCG sealed product. Discover booster boxes, ETBs, bundles, special collections, and fresh finds from marketplace sellers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/sealed-products" className="pt-primary-btn inline-flex min-h-14 items-center justify-center rounded-xl px-7 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:-translate-y-1">
                  Explore the hunt <span className="ml-3 text-lg" aria-hidden="true">↗</span>
                </Link>
                <Link href="/shopify" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-violet-300/35 bg-violet-300/10 px-7 py-4 text-sm font-extrabold text-violet-100 transition hover:border-violet-200/60 hover:bg-violet-300/15">
                  Shop direct <span className="ml-2" aria-hidden="true">↗</span>
                </Link>
                <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 bg-white/[.07] px-7 py-4 text-sm font-extrabold text-white transition hover:border-amber-200/50 hover:bg-white/10">
                  Shop eBay storefront <span className="ml-2" aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-2"><span className="text-amber-300">✦</span> Sealed product finds</span>
                <span className="flex items-center gap-2"><span className="text-cyan-300">◈</span> Collector-first browsing</span>
                <span className="flex items-center gap-2"><span className="text-violet-300">↗</span> Marketplace checkout</span>
              </div>
            </div>

            <div className="pt-hero-art relative mx-auto h-[330px] w-full max-w-[520px] sm:h-[420px]" aria-label="Original trading card and booster pack inspired artwork">
              <div className="pt-orbit pt-orbit-one" />
              <div className="pt-orbit pt-orbit-two" />
              <div className="pt-energy energy-one">✦</div>
              <div className="pt-energy energy-two">✧</div>
              <div className="pt-energy energy-three">✦</div>
              <div className="pt-card pt-card-back"><div className="pt-card-art art-purple"><span>HYPER</span><b>ENERGY</b><i>COLLECTOR SERIES</i></div></div>
              <div className="pt-card pt-card-front"><div className="pt-card-art art-gold"><span>RARE</span><b>FIND</b><i>SEALED • AUTHENTIC • COLLECT</i><div className="pt-card-sigil">✦</div></div></div>
              <div className="pt-booster"><div className="pt-booster-crimp" /><div className="pt-booster-shine" /><span className="pt-booster-small">PULL THEORY PRESENTS</span><strong>THE<br/>NEXT<br/><em>PULL.</em></strong><span className="pt-booster-edition">COLLECTOR DROP · 01</span><div className="pt-booster-orb"><span /></div></div>
              <div className="pt-art-stamp"><span>FIND YOUR</span><b>GRAIL.</b></div>
              <div className="pt-art-caption">SEALED PRODUCT • NEW FINDS • BIG ENERGY</div>
            </div>
          </div>
          <div className="relative z-10 mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3"><span className="pt-stat-icon">01</span><div><p className="text-sm font-black">Find your format</p><p className="mt-1 text-xs text-slate-400">Boxes, bundles, ETBs & more</p></div></div>
            <div className="flex items-center gap-3"><span className="pt-stat-icon">02</span><div><p className="text-sm font-black">Compare the details</p><p className="mt-1 text-xs text-slate-400">Product, seller, condition & shipping</p></div></div>
            <div className="flex items-center gap-3"><span className="pt-stat-icon">03</span><div><p className="text-sm font-black">Make your move</p><p className="mt-1 text-xs text-slate-400">Checkout securely with the retailer</p></div></div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20" id="categories">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-amber-300">Choose your next chase</p><h2 className="mt-3 text-3xl font-black tracking-[-.045em] sm:text-4xl">Find your kind of <span className="text-amber-200">pull.</span></h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Jump straight into the sealed Pokémon category you have your eye on.</p></div>
            <Link href="/sealed-products" className="text-sm font-extrabold text-amber-200 transition hover:text-white">All sealed products ↗</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((item, index) => (
              <article key={item.name} className="pt-category group relative flex min-h-[245px] flex-col overflow-hidden rounded-2xl border border-white/10 p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-200/40">
                <div className="pt-category-glow" aria-hidden="true" />
                <div className="relative z-10 flex items-start justify-between"><span className="pt-category-mark" data-tone={item.tone} aria-hidden="true">{item.mark}</span><span className="pt-category-index">0{index + 1} / {item.tag}</span></div>
                <h3 className="relative z-10 mt-7 text-xl font-black tracking-tight">{item.name}</h3>
                <p className="relative z-10 mt-2 flex-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer sponsored" className="relative z-10 mt-5 inline-flex items-center gap-2 text-sm font-black text-amber-200 transition group-hover:gap-3 group-hover:text-white">Browse listings <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-deal-panel relative mt-16 overflow-hidden rounded-[2rem] border border-amber-200/20 p-7 sm:mt-20 sm:p-10">
          <div className="pt-deal-glow" aria-hidden="true" />
          <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[1fr_auto]">
            <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-amber-200">A collector tip worth remembering</p><h2 className="mt-3 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">The best deal is the one that lands at your door for less.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Compare the exact set, language, condition, seller feedback, and shipping cost before you buy. A low sticker price does not always mean the best total price.</p></div>
            <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex min-h-13 items-center justify-center rounded-xl bg-amber-200 px-6 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:-translate-y-1 hover:bg-amber-100">Explore current listings ↗</a>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="pt-info-card"><span className="text-2xl text-amber-200">✦</span><h3 className="mt-4 font-black">Made for collectors</h3><p className="mt-2 text-sm leading-6 text-slate-400">A focused place to browse sealed Pokémon TCG products by format.</p></div>
          <div className="pt-info-card"><span className="text-2xl text-cyan-200">◈</span><h3 className="mt-4 font-black">Shop with your eyes open</h3><p className="mt-2 text-sm leading-6 text-slate-400">Check seller ratings, product details, item condition, and delivery costs.</p></div>
          <div className="pt-info-card"><span className="text-2xl text-violet-200">↗</span><h3 className="mt-4 font-black">Straight to the retailer</h3><p className="mt-2 text-sm leading-6 text-slate-400">We connect you to marketplace listings. Retailers handle checkout and fulfillment.</p></div>
        </section>

        <footer className="mt-16 border-t border-white/10 pt-8 text-center">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-slate-400"><Link href="/sealed-products" className="hover:text-white">Sealed Products</Link><Link href="/sealed-products#categories" className="hover:text-white">Categories</Link><Link href="/guides" className="hover:text-white">Collector Guides</Link><Link href="/terms" className="hover:text-white">Terms</Link></div>
          <p className="mt-5 text-xs text-slate-500">PullTheoryTrade · Built for the thrill of the next pull.</p>
          <p className="mx-auto mt-4 max-w-3xl text-[10px] leading-5 text-slate-600">Affiliate disclosure: PullTheoryTrade may earn a commission from qualifying purchases made through some links, at no additional cost to you. Product availability, pricing, shipping, and checkout are controlled by the retailer and may change.</p>
        </footer>
      </div>
    </main>
  );
}
