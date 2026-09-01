"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentAccessToken } from "../lib/supabase";

const tabs = [
  { label: "Marketplace", href: "/marketplace/browse", match: "/marketplace" },
  { label: "PullMatches", href: "/matches", match: "/matches" },
  { label: "My Collection", href: "/portfolio", match: "/portfolio" },
  { label: "Trade Center", href: "/offers", match: "/offers" },
  { label: "Membership", href: "/pricing", match: "/pricing" },
];

export default function TopTabs() {
  const pathname = usePathname();
  const [canUsePullShield, setCanUsePullShield] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkPullShieldAccess() {
      const token = await getCurrentAccessToken();
      if (!token) return;
      const response = await fetch("/api/pullshield", {
        method: "HEAD",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (active) setCanUsePullShield(response.ok);
    }

    void checkPullShieldAccess();
    return () => {
      active = false;
    };
  }, []);

  const visibleTabs = canUsePullShield
    ? [...tabs, { label: "PullShield Desk", href: "/pullshield", match: "/pullshield" }]
    : tabs;

  return (
    <nav aria-label="Main navigation" className="flex max-w-full gap-2 overflow-x-auto px-4 pb-3 sm:justify-center">
      {visibleTabs.map((tab) => {
        const active = pathname.startsWith(tab.match);
        return <Link key={tab.href} href={tab.href} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-violet-500 text-white shadow-[0_8px_24px_rgba(124,58,237,0.3)]" : "border border-white/10 bg-white/[0.035] text-zinc-300 hover:border-violet-300/40 hover:text-white"}`}>{tab.label}</Link>;
      })}
    </nav>
  );
}
