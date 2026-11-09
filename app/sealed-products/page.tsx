import Link from "next/link";

const storeUrl = "https://ebay.com/inf/pulltheorytrade?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339243799&toolid=80008&mkevt=1";

function ebaySearchUrl(query: string) {
  const url = new URL("https://www.ebay.com/sch/i.html");
  url.searchParams.set("_nkw", query);
  url.searchParams.set("mkcid", "1");
  url.searchParams.set("mkrid", "711-53200-19255-0");
  url.searchParams.set("toolid", "20023");
  url.searchParams.set("campid", "5339243819");
  url.searchParams.set("customid", "PullTheoryTrade");
  url.searchParams.set("siteid", "0");
  url.searchParams.set("mkevt", "1");
  return url.toString();
}

const collections = [
  {
    eyebrow: "SEALED · BOOSTER BOXES",
    title: "Booster boxes",
    description: "Browse sealed Pokémon booster displays across English and international sets.",
    query: "pokemon tcg booster box sealed",
    tag: "Sealed product",
  },
  {
    eyebrow: "SEALED · ELITE TRAINER BOXES",
    title: "Elite Trainer Boxes",
    description: "Find ETBs with booster packs, sleeves, dice, and set-themed accessories.",
    query: "pokemon tcg elite trainer box sealed",
    tag: "Sealed product",
  },
  {
    eyebrow: "SEALED · BOOSTER BUNDLES",
    title: "Booster bundles",
    description: "Compare compact pack bundles and set-specific sealed products.",
    query: "pokemon tcg booster bundle sealed",
    tag: "Sealed product",
  },
  {
    eyebrow: "SEALED · COLLECTIONS",
    title: "Collection boxes",
    description: "Shop special collections, promo cards, premium boxes, and featured Pokémon.",
    query: "pokemon tcg collection box sealed",
    tag: "Sealed product",
  },
  {
    eyebrow: "SEALED · TINS",
    title: "Tins & premium collections",
    description: "Explore Pokémon tins, premium collection boxes, and special product formats.",
    query: "pokemon tcg premium collection tin sealed",
    tag: "Sealed product",
  },
  {
    eyebrow: "SEALED · CURRENT SETS",
    title: "New releases & restocks",
    description: "Search marketplace listings for the newest Pokémon TCG releases and restocks.",
    query: "pokemon tcg newest release sealed booster etb",
    tag: "New & restocked",
  },
  {
    eyebrow: "SINGLES · CHARIZARD",
    title: "Charizard cards",
    description: "Search raw and graded Charizard cards. Match the exact set, number, and variant.",
    query: "pokemon charizard card",
    tag: "Single cards",
  },
  {
    eyebrow: "SINGLES · PIKACHU",
    title: "Pikachu cards",
    description: "Browse Pikachu promos, illustration rares, vintage cards, and modern releases.",
    query: "pokemon pikachu card",
    tag: "Single cards",
  },
  {
    eyebrow: "SINGLES · ILLUSTRATION RARES",
    title: "Illustration & special art rares",
    description: "Find illustration rares, special illustration rares, and alternate-art Pokémon cards.",
    query: "pokemon special illustration rare card",
    tag: "Single cards",
  },
  {
    eyebrow: "GRADED · PSA",
    title: "PSA graded Pokémon cards",
    description: "Compare graded slabs by exact card, grade, certification details, and seller reputation.",
    query: "pokemon card PSA graded",
    tag: "Graded cards",
  },
  {
    eyebrow: "GRADED · CHARIZARD",
    title: "PSA Charizard slabs",
    description: "Search graded Charizard cards and compare the same card and grade before buying.",
    query: "pokemon charizard PSA 10 graded",
    tag: "Graded cards",
  },
  {
    eyebrow: "VINTAGE · WOTC",
    title: "Vintage Pokémon cards",
    description: "Explore vintage Base Set, Jungle, Fossil, Team Rocket, and other classic cards.",
    query: "pokemon vintage WOTC card",
    tag: "Vintage",
  },
  {
    eyebrow: "COLLECTOR GEAR · BINDERS",
    title: "Binders & card storage",
    description: "Protect and organize your collection with binders, storage boxes, and portfolios.",
    query: "pokemon trading card binder side loading",
    tag: "Collector supplies",
  },
  {
    eyebrow: "COLLECTOR GEAR · PROTECTION",
    title: "Sleeves, top loaders & cases",
    description: "Shop penny sleeves, perfect-fit sleeves, top loaders, slab sleeves, and display cases.",
    query: "trading card sleeves top loaders PSA slab case",
    tag: "Collector supplies",
  },
  {
    eyebrow: "COLLECTOR GEAR · DISPLAY",
    title: "Displays & accessories",
    description: "Find stands, graded-card displays, deck boxes, and accessories for your setup.",
    query: "pokemon trading card display stand deck box",
    tag: "Collector supplies",
  },
] as const;

export const metadata = {
  title: "Pokémon TCG Deals & Collector Finds | PullTheoryTrade",
  description: "Browse affiliate shopping links for Pokémon sealed products, singles, PSA slabs, vintage cards, and collector supplies.",
};

export default function SealedProductsPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl border border-sky-300/20 bg-[radial-gradient(circle_at_85%_0%,rgba(56,189,248,.18),transparent_40%),linear-gradient(135deg,#0c1729,#101827)] px-6 py-10 text-center sm:px-10 sm:py-14">
          <p className="text-xs font-extrabold uppercase tracking-[.22em] text-sky-300">PullTheoryTrade · collector marketplace</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Find your next big pull.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Shop Pokémon sealed products, singles, graded slabs, vintage cards, and gear. Each shopping link opens live eBay search results so you can compare current sellers and listings.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sky-400 px-6 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-sky-300">Visit PullTheory on eBay ↗</a>
            <Link href="/search" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[.06] px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10">Search a Pokémon card</Link>
          </div>
          <p className="mt-5 text-xs text-slate-400">15 shopping categories · live marketplace searches · no inventory claims</p>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-sky-300">Shop the hunt</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Browse Pokémon finds</h2>
            </div>
            <span className="text-xs text-slate-400">Listings, prices & stock are set by eBay sellers</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((item, index) => (
              <article key={item.title} className="flex min-h-56 flex-col rounded-2xl border border-white/10 bg-[#101c2e] p-6 transition hover:border-sky-300/40 hover:bg-[#14233a]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black tracking-[.16em] text-sky-300">{item.eyebrow}</span>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{item.description}</p>
                <a href={ebaySearchUrl(item.query)} target="_blank" rel="noopener noreferrer sponsored" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-400 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-sky-300">
                  Shop {item.tag.toLowerCase()} on eBay ↗
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-amber-200/15 bg-[#171b25] p-6 sm:p-8">
            <h2 className="text-xl font-black">Before you buy</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
              <li>• Match the exact set, card number, language, and variant.</li>
              <li>• For slabs, verify the grade and certification details.</li>
              <li>• Compare item price plus shipping—not just the headline price.</li>
              <li>• Check seller feedback, photos, condition, and return terms.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-sky-300/15 bg-[#0c1729] p-6 sm:p-8">
            <h2 className="text-xl font-black">Shop with PullTheoryTrade</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Use our card search to identify a card, then jump to marketplace listings to compare copies for sale. Want to browse the full eBay marketplace? Start with our affiliate storefront.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/search" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">Open card search</Link>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-400 px-4 py-3 text-sm font-extrabold text-slate-950 hover:bg-sky-300">Open eBay storefront ↗</a>
            </div>
          </article>
        </section>

        <p className="mt-8 text-center text-xs leading-5 text-slate-500">
          Affiliate disclosure: PullTheoryTrade participates in the eBay Partner Network. We may earn a commission from qualifying purchases made through these links, at no additional cost to you. Links open third-party eBay listings; PullTheoryTrade does not own or stock the products shown there. Prices, availability, shipping, condition, and seller terms can change and are controlled by the listing seller.
        </p>
      </div>
    </main>
  );
}
