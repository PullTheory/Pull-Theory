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
    <style jsx global>{`\n      @media (min-width: 1024px) {\n        main > div > section:first-child { max-width: 760px; margin-left: auto; margin-right: auto; }\n      }\n      main > div > section:first-child { background: #15150d; border-color: rgba(251,191,36,.58); padding: 2.4rem 2.5rem 2.2rem; }\n      main > div > section:first-child > div:first-child { display: block; text-align: center; }\n      main > div > section:first-child > div:first-child > div:first-child > p:first-child { letter-spacing: .28em; }\n      main > div > section:first-child > div:first-child > div:first-child > h2 { font-size: 0; line-height: 1.05; margin-top: 1rem; }\n      main > div > section:first-child > div:first-child > div:first-child > h2::before { content: \"🏆\"; display: inline-block; font-size: 2.8rem; margin-right: .65rem; vertical-align: .08em; }\n      main > div > section:first-child > div:first-child > div:first-child > h2::after { content: \"WIN ALL 5 PSA SLABS\"; font-size: 2.7rem; line-height: 1.05; font-weight: 900; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(1) { font-size: 0; line-height: 1.8; max-width: 600px; margin-left: auto; margin-right: auto; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(1)::after { content: \"A paid PullTheory membership is required to enter. One winner receives the entire five-card bundle. A value of $150.\"; font-size: 1rem; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(2) { font-size: 0; margin-top: 1.5rem; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(2)::after { content: \"Winner selected 11/11/2026.\"; font-size: 1.7rem; font-weight: 900; color: #fde68a; }\n      main > div > section:first-child > div:first-child > a { display: block; width: 92%; margin: 1.8rem auto 0; border: 1px solid rgba(251,191,36,.75); border-radius: 1.25rem; background: rgba(251,191,36,.13); padding: 1.25rem 1.5rem; color: #fde68a; }\n      main > div > section:first-child > div:first-child > a { font-size: 0; }\n      main > div > section:first-child > div:first-child > a::after { content: \"🎁  See the PSA Giveaway\"; font-size: 1.1rem; font-weight: 900; }\n      main > div > section:first-child > div:last-child { margin-top: 1.55rem; display: block; text-align: center; background: transparent; border: 0; padding: .2rem 0; }\n      main > div > section:first-child > div:last-child > div { display: none; }\n      main > div > section:first-child > div:last-child::after { content: \"Paid membership entry · Five-card bundle\"; color: #8b8b94; font-size: 1rem; }\n    `}</style>
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
