import Link from "next/link";

const shopifyUrl = "https://pulltheorytrade.myshopify.com";
const shopifyCatalogUrl = "https://pulltheorytrade.myshopify.com/collections/all";
const ebayUrl = "https://ebay.com/inf/pulltheorytrade?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339243799&toolid=80008&mkevt=1";

export const metadata = {
  title: "Shop PullTheoryTrade Direct | Shopify Store",
  description: "Browse Pokémon TCG products in the PullTheoryTrade Shopify store.",
};

export default function ShopifyStorePage() {
  return (
    <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[2rem] border border-violet-300/20 bg-[radial-gradient(circle_at_85%_0%,rgba(124,58,237,.22),transparent_42%),linear-gradient(135deg,#11182d,#0b1424)] p-7 sm:p-12">
          <p className="text-xs font-black uppercase tracking-[.24em] text-violet-200">PullTheoryTrade · direct shop</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Shop direct. Collect with confidence.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Browse Pokémon TCG products in the PullTheoryTrade Shopify store. Product availability and checkout are handled securely by Shopify, and inventory can change as suppliers update stock.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={shopifyCatalogUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200">Shop available products ↗</a>
            <Link href="/sealed-products" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[.06] px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">Compare eBay deals</Link>
          </div>
        </section>
        <section className="mt-7 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-violet-300/20 bg-violet-300/[.06] p-6">
            <p className="text-xs font-black uppercase tracking-[.18em] text-violet-200">Direct store</p>
            <h2 className="mt-3 text-2xl font-black">Shopify checkout</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">See current product listings, confirm the variant and stock, and complete your order through the Shopify storefront.</p>
            <a href={shopifyCatalogUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-black text-violet-100 hover:text-white">Browse Shopify catalog ↗</a>
          </article>
          <article className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[.05] p-6">
            <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Marketplace</p>
            <h2 className="mt-3 text-2xl font-black">eBay deals</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Compare third-party listings by exact product, language, condition, seller feedback, and shipping before checkout.</p>
            <a href={ebayUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-5 inline-flex text-sm font-black text-cyan-100 hover:text-white">Visit eBay storefront ↗</a>
          </article>
        </section>
        <p className="mt-8 text-center text-xs leading-5 text-slate-500">Shopify is PullTheoryTrade’s direct store. eBay is a separate third-party marketplace destination. Availability, checkout, shipping, and returns are handled by the respective seller or platform. Some supplier listings may sell out or change without notice.</p>
      </div>
    </main>
  );
}
