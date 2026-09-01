"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Listing = { id: number; name: string; offeredCard: string; desiredCard?: string; notes?: string };

export default function MarketplaceShowcase() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/trades?is_listing=true&pageSize=12");
        const data = await response.json();
        if (response.ok) setListings(data.items ?? []);
      } catch {}
    }
    load();
    const refresh = window.setInterval(load, 20000);
    return () => window.clearInterval(refresh);
  }, []);

  useEffect(() => {
    if (listings.length < 2) return;
    const rotation = window.setInterval(() => setActiveIndex((current) => (current + 1) % listings.length), 4500);
    return () => window.clearInterval(rotation);
  }, [listings.length]);

  const active = listings[activeIndex];

  return <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8"><div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_15%,rgba(124,58,237,0.18),transparent_34%),rgba(255,255,255,0.035)] p-7 sm:p-10"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Live marketplace</p><h2 className="mt-2 text-3xl font-semibold">Fresh cards up for trade.</h2></div><Link href="/marketplace/browse" className="text-sm font-semibold text-violet-300 transition hover:text-violet-200">Browse all trades →</Link></div>{active ? <Link href={`/marketplace/${active.id}`} className="mt-8 block rounded-3xl border border-white/10 bg-black/30 p-6 transition hover:border-violet-400/45 hover:bg-black/40"><div className="flex items-center justify-between gap-4"><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Available for trade</span><span className="text-xs text-zinc-500">Listing #{active.id}</span></div><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wider text-zinc-500">Offered card</p><p className="mt-2 text-2xl font-semibold text-white">{active.offeredCard}</p><p className="mt-3 text-sm text-zinc-400">Listed by {active.name}</p></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5"><p className="text-xs uppercase tracking-wider text-zinc-500">Looking for</p><p className="mt-2 font-medium text-zinc-100">{active.desiredCard || "Open to offers"}</p><p className="mt-3 text-sm text-violet-200">View listing & make an offer →</p></div></div></Link> : <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-zinc-400">No cards are listed yet. New marketplace listings will appear here automatically.</div>}{listings.length > 1 && <div className="mt-5 flex gap-2">{listings.map((listing, index) => <button key={listing.id} type="button" aria-label={`Show listing ${index + 1}`} onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition ${index === activeIndex ? "w-8 bg-violet-400" : "w-3 bg-white/20 hover:bg-white/40"}`} />)}</div>}</div></section>;
}
