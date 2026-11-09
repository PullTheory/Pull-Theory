import Link from "next/link";

const storeUrl = "https://ebay.com/inf/pulltheorytrade?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339243799&toolid=80008&mkevt=1";
const categories = [
  ["Booster Boxes", "Sealed booster displays for collectors and players.", "Explore booster box listings"],
  ["Elite Trainer Boxes", "ETBs with booster packs and set-themed accessories.", "Explore ETB listings"],
  ["Booster Bundles", "A pack-focused sealed option in a compact box.", "Explore bundle listings"],
  ["Collection Boxes", "Special boxes, promo cards, and collectible releases.", "Explore collection boxes"],
  ["Tins & Premium Collections", "Tins, premium boxes, and special product formats.", "Explore special products"],
  ["New Releases & Restocks", "Check current listings for fresh releases and returning stock.", "Check current listings"],
] as const;

export const metadata = {
  title: "Shop Sealed Pokémon Products | PullTheoryTrade",
  description: "Browse Pokémon booster boxes, Elite Trainer Boxes, booster bundles, collection boxes, and more through PullTheoryTrade.",
};

export default function SealedProductsPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-sky-300/15 bg-[#0c1729] px-6 py-10 text-center sm:px-10 sm:py-14">
          <p className="text-xs font-extrabold uppercase tracking-[.22em] text-sky-300">PullTheoryTrade · sealed shop</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Shop Pokémon sealed products</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Choose the product type you are hunting for, then browse current retailer listings. Always confirm the exact set, language, box configuration, seller, condition, and shipping before checkout.</p>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-7 inline-flex rounded-xl bg-sky-400 px-6 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-sky-300">Browse current eBay listings ↗</a>
        </section>
        <section id="categories" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(([name, description, cta], index) => (
            <article key={name} className="flex min-h-56 flex-col rounded-2xl border border-white/10 bg-[#101c2e] p-6">
              <span className="text-xs font-black tracking-[.2em] text-sky-300">0{index + 1} / SEALED</span>
              <h2 className="mt-4 text-xl font-extrabold">{name}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{description}</p>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-sky-200 hover:text-white">{cta} <span aria-hidden="true">↗</span></a>
            </article>
          ))}
        </section>
        <section className="mt-10 rounded-2xl border border-amber-200/15 bg-[#171b25] p-6 sm:p-8">
          <h2 className="text-xl font-black">A quick checklist before you buy</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-300 sm:grid-cols-2">
            <li>• Match the exact Pokémon set and product name.</li>
            <li>• Check language, region, and box configuration.</li>
            <li>• Compare item price plus shipping.</li>
            <li>• Review seller feedback and return terms.</li>
          </ul>
          <p className="mt-5 text-xs leading-5 text-slate-500">PullTheoryTrade may earn a commission from qualifying purchases made through affiliate links, at no additional cost to you. Product availability and pricing are set by third-party sellers and can change at any time.</p>
        </section>
      </div>
    </main>
  );
}
