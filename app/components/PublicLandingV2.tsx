import Link from "next/link";

const storeUrl = "https://ebay.com/inf/pulltheorytrade?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339243799&toolid=80008&mkevt=1";

const categories = [
  { name: "Booster Boxes", detail: "The go-to sealed format for set builders and pack rippers.", mark: "▦", tag: "BOXES" },
  { name: "Elite Trainer Boxes", detail: "A great all-in-one pick with packs and accessories.", mark: "✦", tag: "ETBs" },
  { name: "Booster Bundles", detail: "Compact sealed options when you want packs without the extras.", mark: "▤", tag: "BUNDLES" },
  { name: "Collection Boxes", detail: "Special releases, promo cards, and display-worthy boxes.", mark: "◇", tag: "COLLECTIONS" },
  { name: "Tins & Special Sets", detail: "Explore tins, premium collections, and limited releases.", mark: "⬡", tag: "SPECIAL" },
  { name: "New Releases & Restocks", detail: "Keep an eye out for newly available sealed products.", mark: "↗", tag: "FRESH FINDS" },
];

const storeUrlFor = (_category: string) => storeUrl;

export default function PublicLandingV2() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-6 text-white sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-sky-300/20 bg-[#0b1729] px-5 py-14 shadow-[0_28px_100px_rgba(2,8,23,.5)] sm:px-10 sm:py-20 lg:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_0%,rgba(37,99,235,.36),transparent_44%),radial-gradient(ellipse_at_90%_100%,rgba(14,165,233,.2),transparent_42%)]" />
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex rounded-full border border-sky-200/20 bg-sky-200/[.07] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.22em] text-sky-200">The sealed Pokémon shop</p>
            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-7xl">Find your next <span className="text-sky-300">sealed Pokémon</span> pickup.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">Discover booster boxes, Elite Trainer Boxes, booster bundles, collection boxes, and more. PullTheoryTrade helps collectors find products and shop trusted marketplace listings.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/sealed-products" className="inline-flex min-h-13 items-center justify-center rounded-xl bg-sky-400 px-7 py-3.5 text-base font-extrabold text-slate-950 shadow-lg shadow-sky-950/30 transition hover:-translate-y-0.5 hover:bg-sky-300">Explore sealed products <span className="ml-2" aria-hidden="true">→</span></Link>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/15 bg-white/[.06] px-7 py-3.5 text-base font-bold text-white transition hover:bg-white/10">Shop our eBay storefront ↗</a>
            </div>
            <p className="mt-4 text-xs text-slate-400">Compare listings and shipping before you buy · Checkout is completed with the retailer</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-center"><p className="text-sm font-bold">Sealed products</p><p className="mt-1 text-xs text-slate-400">Shop boxes, bundles & more</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-center"><p className="text-sm font-bold">Deal discovery</p><p className="mt-1 text-xs text-slate-400">Look for value and restocks</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-center"><p className="text-sm font-bold">Collector focused</p><p className="mt-1 text-xs text-slate-400">Made for Pokémon fans</p></div>
          </div>
        </section>

        <section className="mt-14" id="categories">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-sky-300">Shop by product type</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Find the sealed product you want.</h2></div>
            <Link href="/sealed-products" className="text-sm font-bold text-sky-200 hover:text-white">View all categories →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((item) => (
              <article key={item.name} className="group flex min-h-52 flex-col rounded-2xl border border-white/10 bg-[#101c2e] p-6 transition hover:-translate-y-1 hover:border-sky-300/35 hover:bg-[#14243b]">
                <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl border border-sky-200/15 bg-sky-300/10 text-2xl text-sky-200" aria-hidden="true">{item.mark}</span><span className="text-[10px] font-extrabold tracking-[.18em] text-slate-500">{item.tag}</span></div>
                <h3 className="mt-5 text-xl font-extrabold">{item.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                <a href={storeUrlFor(item.name)} target="_blank" rel="noopener noreferrer sponsored" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-sky-200 group-hover:text-white">Browse listings <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[#101827] p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-sky-300">A smarter way to shop sealed</p>
            <h2 className="mt-3 text-2xl font-black">Check the full price, not just the sticker.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Before choosing a listing, compare the exact product and version, seller feedback, item condition, and shipping cost. A low item price is not always the best delivered deal.</p>
            <Link href="/sealed-products" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-sky-200 hover:text-white">Browse product categories →</Link>
          </div>
          <div className="rounded-2xl border border-amber-200/15 bg-[radial-gradient(ellipse_at_top_right,rgba(217,170,74,.15),transparent_55%),#111827] p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-200">PullTheoryTrade storefront</p>
            <h2 className="mt-3 text-2xl font-black">Ready to see what is available?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Browse our eBay storefront for current Pokémon sealed product listings. Availability, prices, shipping, and checkout are controlled by eBay sellers.</p>
            <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-200 px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-100">Visit eBay storefront ↗</a>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-white/10 bg-[#0d1523] p-6 text-center sm:p-9">
          <h2 className="text-xl font-black">How PullTheoryTrade works</h2>
          <div className="mx-auto mt-6 grid max-w-4xl gap-5 text-left sm:grid-cols-3">
            <div><p className="text-sm font-extrabold text-sky-200">01 · Discover</p><p className="mt-2 text-sm leading-6 text-slate-400">Choose the sealed product category you are looking for.</p></div>
            <div><p className="text-sm font-extrabold text-sky-200">02 · Compare</p><p className="mt-2 text-sm leading-6 text-slate-400">Review product details, seller reputation, and shipping.</p></div>
            <div><p className="text-sm font-extrabold text-sky-200">03 · Shop</p><p className="mt-2 text-sm leading-6 text-slate-400">Follow the retailer link to complete your purchase there.</p></div>
          </div>
          <p className="mx-auto mt-7 max-w-3xl text-[11px] leading-5 text-slate-500">Affiliate disclosure: PullTheoryTrade may earn a commission from qualifying purchases made through some links, at no additional cost to you. Product availability and pricing can change; confirm details with the retailer before checkout.</p>
        </section>

        <footer className="mt-14 border-t border-white/10 pt-7 text-center">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-semibold text-slate-400">
            <Link href="/sealed-products" className="hover:text-white">Sealed Products</Link><Link href="/sealed-products#categories" className="hover:text-white">Product Categories</Link><Link href="/guides" className="hover:text-white">Collector Guides</Link><Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p className="mt-5 text-xs text-slate-600">PullTheoryTrade · Your destination for Pokémon sealed product deals.</p>
        </footer>
      </div>
    </main>
  );
}
