"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentAccessToken } from "../lib/supabase";

const primaryTabs = [
  { label: "Home", href: "/", match: "/" },
  { label: "Shop", href: "/shopify", match: "/shopify" },
  { label: "Sealed & Deals", href: "/sealed-products", match: "/sealed-products" },
  { label: "Card Search", href: "/search", match: "/search" },
  { label: "Marketplace", href: "/marketplace/browse", match: "/marketplace" },
  { label: "My Collection", href: "/portfolio", match: "/portfolio" },
  { label: "Memberships", href: "/pricing", match: "/pricing" },
];

const moreTabs = [
  { label: "Sell a card", href: "/sell", match: "/sell" },
  { label: "Trade cards", href: "/trade", match: "/trade" },
  { label: "My binders", href: "/binders", match: "/binders" },
  { label: "Saved wants", href: "/wants", match: "/wants" },
  { label: "Seller tools", href: "/seller-calculator", match: "/seller-calculator" },
  { label: "Events & community", href: "/events", match: "/events" },
  { label: "Collector guides", href: "/guides", match: "/guides" },
  { label: "Collector showcase", href: "/collector-showcase", match: "/collector-showcase" },
  { label: "PullShield", href: "/pullshield", match: "/pullshield" },
];

export default function TopTabs() {
  const pathname = usePathname();
  const [canUsePullShield, setCanUsePullShield] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkPullShieldAccess() {
      const token = await getCurrentAccessToken();
      if (!token) return;
      const response = await fetch("/api/pullshield", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (active) setCanUsePullShield(response.ok);
    }
    void checkPullShieldAccess();
    return () => { active = false; };
  }, []);

  useEffect(() => { setMoreOpen(false); }, [pathname]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const adminTabs = canUsePullShield ? [
    { label: "Traffic & Analytics", href: "/owner/traffic", match: "/owner/traffic" },
    { label: "Referral Admin", href: "/admin/referrals", match: "/admin/referrals" },
    { label: "PullShield Desk", href: "/pullshield", match: "/pullshield" },
    { label: "PullShield Verify", href: "/pullshield/authentication", match: "/pullshield/authentication" },
  ] : [];
  const moreActive = moreTabs.some((tab) => pathname.startsWith(tab.match)) || adminTabs.some((tab) => pathname.startsWith(tab.match));

  return (
    <nav aria-label="Main navigation" className="pt-navigation border-t border-white/[.06]">
      <div className="pt-navigation-inner mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-3 py-2.5 sm:px-6">
        {primaryTabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.match);
          return <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={`pt-nav-link whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-extrabold transition sm:px-3.5 sm:text-sm ${active ? "pt-nav-active" : "text-slate-300 hover:bg-white/[.07] hover:text-white"}`}>{tab.label}</Link>;
        })}
        <div className="relative shrink-0">
          <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} aria-haspopup="true" className={`pt-nav-link whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-extrabold transition sm:px-3.5 sm:text-sm ${moreActive || moreOpen ? "pt-nav-active" : "text-slate-300 hover:bg-white/[.07] hover:text-white"}`}>
            More <span aria-hidden="true" className="ml-1">{moreOpen ? "⌃" : "⌄"}</span>
          </button>
          {moreOpen && <div className="pt-nav-menu absolute right-0 top-[calc(100%+0.55rem)] z-50 w-72 rounded-2xl border border-white/10 p-3 shadow-2xl shadow-black/50">
            <p className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[.18em] text-amber-200/80">Explore PullTheory</p>
            {moreTabs.map((tab) => <Link key={tab.href} href={tab.href} onClick={() => setMoreOpen(false)} className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${pathname.startsWith(tab.match) ? "bg-amber-200/10 text-amber-100" : "text-slate-300 hover:bg-white/[.06] hover:text-white"}`}>{tab.label}</Link>)}
            {adminTabs.length > 0 && <>
              <div className="my-2 border-t border-white/10" />
              <p className="px-3 pb-1 pt-1 text-[10px] font-black uppercase tracking-[.18em] text-emerald-200/75">Private owner tools</p>
              {adminTabs.map((tab) => <Link key={tab.href} href={tab.href} onClick={() => setMoreOpen(false)} className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${pathname.startsWith(tab.match) ? "bg-emerald-300/10 text-emerald-100" : "text-slate-300 hover:bg-white/[.06] hover:text-white"}`}>{tab.label}</Link>)}
            </>}
          </div>}
        </div>
      </div>
    </nav>
  );
}
