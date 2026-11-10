import Link from "next/link";

const groups = [
  { title: "Shop", links: [{ label: "Direct store", href: "/shopify" }, { label: "Sealed products & deals", href: "/sealed-products" }, { label: "Card search", href: "/search" }, { label: "Marketplace", href: "/marketplace/browse" }] },
  { title: "Collect", links: [{ label: "My collection", href: "/portfolio" }, { label: "Binders", href: "/binders" }, { label: "Saved wants", href: "/wants" }, { label: "Memberships", href: "/pricing" }] },
  { title: "Community", links: [{ label: "Sell a card", href: "/sell" }, { label: "Trade cards", href: "/trade" }, { label: "Events", href: "/events" }, { label: "Collector guides", href: "/guides" }] },
  { title: "Trust & help", links: [{ label: "PullShield", href: "/pullshield" }, { label: "Trust center", href: "/trust" }, { label: "Terms", href: "/terms" }, { label: "Sign in", href: "/login" }] },
];

export default function SiteFooter() {
  return (
    <footer className="pt-footer mt-auto border-t border-amber-200/15">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3 no-underline">
              <img src="/logo.png" alt="" className="h-11 w-11 rounded-xl border border-amber-200/25" />
              <span className="text-sm font-black uppercase tracking-[.14em] text-white">Pull<span className="text-amber-300">Theory</span></span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-400">A home base for collectors. Discover cards and sealed products, manage your collection, and connect through the PullTheory marketplace.</p>
            <p className="mt-4 text-[11px] leading-5 text-slate-500">Some shopping links may earn PullTheoryTrade a commission at no additional cost to you. Third-party sellers control their listings, pricing, shipping, and checkout.</p>
          </div>
          {groups.map((group) => <div key={group.title}>
            <h2 className="text-xs font-black uppercase tracking-[.18em] text-amber-200">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-slate-400 transition hover:text-white no-underline">{link.label}</Link></li>)}
            </ul>
          </div>)}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PullTheoryTrade. Built for the love of the hobby.</p>
          <p>Collect · Connect · Discover</p>
        </div>
      </div>
    </footer>
  );
}
