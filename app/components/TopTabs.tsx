"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentAccessToken } from "../lib/supabase";

const primaryTabs = [
  { label: "Home", href: "/", match: "/" },
  { label: "Sealed Products", href: "/sealed-products", match: "/sealed-products" },
  { label: "Deals & Restocks", href: "/sealed-products#categories", match: "/deals" },
];

const moreTabs = [
  { label: "Collector Guides", href: "/guides", match: "/guides" },
  { label: "My Collection", href: "/portfolio", match: "/portfolio" },
  { label: "Want List", href: "/wants", match: "/wants" },
  { label: "Community & Events", href: "/events", match: "/events" },
  { label: "Trading (community)", href: "/offers", match: "/offers" },
  { label: "Sell Cards (community)", href: "/sell", match: "/sell" },
  { label: "Sell a Collection", href: "/collection-selling", match: "/collection-selling" },
  { label: "Seller Center", href: "/seller", match: "/seller" },
  { label: "Memberships", href: "/pricing", match: "/pricing" },
  { label: "Trust Center", href: "/trust", match: "/trust" },
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
    { label: "Referral Admin", href: "/admin/referrals", match: "/admin/referrals" },
    { label: "PullShield Desk", href: "/pullshield", match: "/pullshield" },
    { label: "PullShield Verify", href: "/pullshield/authentication", match: "/pullshield/authentication" },
  ] : [];
  const allMoreTabs = [...moreTabs, ...adminTabs];
  const moreActive = allMoreTabs.some((tab) => pathname.startsWith(tab.match));

  return (
    <nav aria-label="Main navigation" className="border-t border-white/[.05]">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
        {primaryTabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.match);
          return <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition sm:text-sm ${active ? "bg-sky-400 text-slate-950 shadow-sm shadow-sky-950/30" : "text-slate-300 hover:bg-white/[.07] hover:text-white"}`}>{tab.label}</Link>;
        })}
        <div className="relative shrink-0">
          <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} aria-haspopup="true" className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition sm:text-sm ${moreActive || moreOpen ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/[.07] hover:text-white"}`}>
            More <span aria-hidden="true" className="ml-1">{moreOpen ? "⌃" : "⌄"}</span>
          </button>
          {moreOpen && (
            <div className="absolute left-0 top-[calc(100%+0.55rem)] z-50 grid w-64 gap-1 rounded-2xl border border-white/10 bg-[#111c2d] p-2 shadow-2xl shadow-black/50 sm:left-auto sm:right-0">
              {allMoreTabs.map((tab) => {
                const active = pathname.startsWith(tab.match);
                return <Link key={tab.href} href={tab.href} onClick={() => setMoreOpen(false)} className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-sky-300/10 text-sky-200" : "text-slate-300 hover:bg-white/[.06] hover:text-white"}`}>{tab.label}</Link>;
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
