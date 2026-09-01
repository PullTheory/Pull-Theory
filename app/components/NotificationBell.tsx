"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const token = await getCurrentAccessToken();
        if (!token) {
          if (active) { setCount(0); setReady(true); }
          return;
        }
        const response = await fetch("/api/offers", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (active && response.ok) {
          const newOffers = Array.isArray(data.offers) ? data.offers.filter((offer: { status?: string }) => !offer.status || offer.status === "pending") : [];
          setCount(newOffers.length);
          setReady(true);
        }
      } catch {
        if (active) setReady(true);
      }
    }

    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  if (!ready) return <div className="h-10 w-10" aria-hidden="true" />;

  return <Link href="/offers" title={count ? `${count} new offer${count === 1 ? "" : "s"}` : "View your offers"} aria-label={count ? `${count} new trade offer${count === 1 ? "" : "s"}` : "View your offers"} className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${count ? "border-amber-300/35 bg-amber-300/[0.1] text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.28)] hover:bg-amber-300/[0.18]" : "border-white/15 bg-white/[0.05] text-zinc-200 hover:border-violet-300/40 hover:bg-violet-500/10 hover:text-violet-100"}`}>
    {count > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 animate-pulse rounded-full bg-amber-300" />}
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
    {count > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white">{count > 9 ? "9+" : count}</span>}
  </Link>;
}
