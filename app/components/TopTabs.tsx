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
    <style jsx global>{`\n      main > div > section:first-child { max-width: 900px; margin-left: auto; margin-right: auto; background: #111109; border-color: rgba(251,191,36,.58); padding: 2rem 2.25rem 2.25rem; }\n      main > div > section:first-child > div:first-child { display: block; text-align: left; }\n      main > div > section:first-child > div:first-child > div:first-child > p:first-child { display: flex; align-items: center; gap: .55rem; letter-spacing: .28em; }\n      main > div > section:first-child > div:first-child > div:first-child > p:first-child::before { content: \"🎁\"; letter-spacing: normal; font-size: 1.1rem; }\n      main > div > section:first-child > div:first-child > div:first-child > h2 { font-size: 0; line-height: 1.12; margin-top: 1rem; max-width: 650px; }\n      main > div > section:first-child > div:first-child > div:first-child > h2::after { content: \"Win all 5 graded\\A Pokémon cards.\"; white-space: pre; font-size: clamp(2.35rem, 6vw, 4rem); line-height: 1.08; font-weight: 900; letter-spacing: -.035em; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(1) { font-size: 0; line-height: 1.75; max-width: 720px; margin-top: 1.9rem; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(1)::after { content: \"A paid PullTheory membership is required to enter. One winner receives the entire five-card bundle. A value of $150.\"; font-size: clamp(1rem, 2.3vw, 1.25rem); color: #d4d4d8; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(2) { font-size: 0; margin-top: 1.6rem; }\n      main > div > section:first-child > div:first-child > div:first-child > p:nth-of-type(2)::after { content: \"Winner selected 11/11/2026.\"; font-size: clamp(1.55rem, 3.4vw, 2.05rem); font-weight: 900; color: #fde68a; }\n      main > div > section:first-child > div:first-child > a { display: block; width: 100%; margin: 2.2rem auto 0; padding: 0; border: 0; background: transparent; color: transparent; font-size: 0; }\n      main > div > section:first-child > div:first-child > a::before { content: \"VIEW MEMBERSHIP\"; display: block; width: 100%; box-sizing: border-box; border-radius: 1.25rem; background: #ffd236; color: #080808; padding: 1.25rem 1rem; text-align: center; font-size: clamp(1.05rem, 2.4vw, 1.3rem); font-weight: 900; }\n      main > div > section:first-child > div:first-child > a::after { content: \"\"; display: block; width: 100%; height: 235px; margin-top: 3.8rem; background: url('/giveaway-slabs.svg') center center / contain no-repeat; }\n      main > div > section:first-child > p { margin-top: 1rem; text-align: center; font-size: 0; color: #f4f4f5; }\n      main > div > section:first-child > p::after { content: \"Pikachu — PSA 10\\A Swablu — PSA 9\\A Giovanni's Exile (Full Art) — PSA 9\\A Iono's Kilowattrel — PSA 8\\A Team Rocket's Orbeetle — PSA 9\"; white-space: pre; display: block; font-size: clamp(.95rem, 2.2vw, 1.1rem); line-height: 2.05; font-weight: 700; }\n      main > div > section:first-child > div:last-child { display: none; }\n      @media (max-width: 640px) {\n        main > div > section:first-child { padding: 1.8rem 1.6rem 2rem; }\n        main > div > section:first-child > div:first-child > a::after { height: 190px; margin-top: 3.2rem; }\n      }\n    `}</style>
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
