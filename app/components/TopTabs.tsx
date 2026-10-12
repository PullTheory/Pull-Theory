"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentAccessToken } from "../lib/supabase";

const primaryTabs = [
  { label: "Marketplace", href: "/marketplace/browse", match: "/marketplace" },
  { label: "Trading", href: "/offers", match: "/offers" },
  { label: "My Collection", href: "/portfolio", match: "/portfolio" },
  { label: "Community", href: "/events", match: "/events" },
];

const moreTabs = [
  { label: "My Want List", href: "/wants", match: "/wants" },
  { label: "PullMatches", href: "/matches", match: "/matches" },
  { label: "Collector Showcase", href: "/collector-showcase", match: "/collector-showcase" },
  { label: "Guides", href: "/guides", match: "/guides" },
  { label: "Seller Center", href: "/seller", match: "/seller" },
  { label: "Membership", href: "/pricing", match: "/pricing" },
  { label: "Ambassadors", href: "/ambassadors", match: "/ambassadors" },
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

  const adminTabs = canUsePullShield ? [
    { label: "Referral Admin", href: "/admin/referrals", match: "/admin/referrals" },
    { label: "PullShield Desk", href: "/pullshield", match: "/pullshield" },
    { label: "PullShield Verify", href: "/pullshield/authentication", match: "/pullshield/authentication" },
  ] : [];
  const allMoreTabs = [...moreTabs, ...adminTabs];
  const moreActive = allMoreTabs.some((tab) => pathname.startsWith(tab.match));

  return <nav aria-label="Main navigation" className="relative flex max-w-full items-center justify-center gap-2 px-4 pb-3">
    <div className="flex max-w-full gap-2 overflow-x-auto">
      {primaryTabs.map((tab) => {
        const active = pathname.startsWith(tab.match);
        return <Link key={tab.href} href={tab.href} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-violet-500 text-white shadow-[0_8px_24px_rgba(124,58,237,0.3)]" : "border border-white/10 bg-white/[0.035] text-zinc-300 hover:border-violet-300/40 hover:text-white"}`}>{tab.label}</Link>;
      })}
      <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${moreActive ? "border-violet-300/50 bg-violet-500 text-white" : "border-white/10 bg-white/[0.035] text-zinc-300 hover:border-violet-300/40 hover:text-white"}`}>
        More {moreOpen ? "↑" : "↓"}
      </button>
    </div>
    {moreOpen && <div className="absolute right-4 top-12 z-50 grid min-w-56 gap-1 rounded-2xl border border-white/10 bg-[#111116] p-2 shadow-2xl">
      {allMoreTabs.map((tab) => {
        const active = pathname.startsWith(tab.match);
        return <Link key={tab.href} href={tab.href} onClick={() => setMoreOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${active ? "bg-violet-500/20 text-violet-200" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}>{tab.label}</Link>;
      })}
    </div>}
  </nav>;
}
