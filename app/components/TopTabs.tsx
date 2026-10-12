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

  return <>
    <style jsx global>{`\n      @media (min-width: 1024px) {\n        main > div > section:first-child { max-width: 650px; margin-left: auto; margin-right: auto; }\n      }\n      main > div > section:first-child { background: #0d0e0a; border-color: rgba(251,191,36,.42); padding: 2rem 2.25rem 2.25rem; }\n      main > div > section:first-child > div:first-child { display: block; text-align: center; }\n      main > div > section:first-child > div:first-child > div:first-child > p:first-child { letter-spacing: .28em; }\n      main > div > section:first-child > div:first-child > div:first-child > h2 { font-size: 2.35rem; line-height: 1.08; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(1) { font-size: 0; line-height: 1.6; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(1)::after { content: \"A paid PullTheory membership is required to enter. One winner receives the entire five-card bundle. A value of $150\"; font-size: 1rem; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(2) { font-size: 0; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(2)::after { content: \"Winner selected November 11, 2026.\"; font-size: 1rem; }\n      main > div > section:first-child > div:first-child > a { display: block; width: 100%; margin-top: 1.75rem; border-radius: 1.5rem; background: #ffd43b; padding: 1.05rem 1.5rem; }\n      main > div > section:first-child > div:first-child > a { font-size: 0; }\n      main > div > section:first-child > div:first-child > a::after { content: \"VIEW MEMBERSHIP\"; font-size: 1.05rem; }\n      main > div > section:first-child > div:last-child { margin-top: 1.9rem; display: flex; flex-direction: column; align-items: center; gap: .7rem; background: transparent; border: 0; }\n      main > div > section:first-child > div:last-child > div { width: 100%; max-width: 520px; border: 0; background: transparent; padding: .1rem 0; text-align: center; font-size: 1rem; }\n    `}</style>
    <nav aria-label="Main navigation" className="relative flex max-w-full items-center justify-center gap-2 px-4 pb-3">
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
    </nav>
  </>;
}
