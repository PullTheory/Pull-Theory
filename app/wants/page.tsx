"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";

type Want = { id: number; card_id?: string | null; card_name: string; card_set?: string | null; card_number?: string | null; image_url?: string | null };
type Listing = { id: number; name: string; offeredCard: string; desiredCard: string; notes?: string; photoUrls?: string[]; listingType?: "trade" | "sell" | "trade_or_sell"; salePriceCents?: number | null };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function WantListPage() {
  const [wants, setWants] = useState<Want[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true); setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to view your Want List.");
      const [wantsResponse, listingsResponse] = await Promise.all([
        fetch("/api/wants", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
        fetch("/api/trades?is_listing=true&pageSize=100", { cache: "no-store" }),
      ]);
      const wantsData = await wantsResponse.json();
      const listingsData = await listingsResponse.json();
      if (!wantsResponse.ok) throw new Error(wantsData.error ?? "Unable to load your Want List.");
      setWants(wantsData.wants ?? []);
      setListings(listingsResponse.ok ? listingsData.items ?? [] : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load your Want List.");
    } finally { setLoading(false); }
  }

  async function remove(id: number) {
    setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to update your Want List.");
      const response = await fetch(`/api/wants?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to remove this card.");
      setWants((current) => current.filter((want) => want.id !== id));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to remove this card."); }
  }

  const matchesFor = useMemo(() => (want: Want) => {
    const wanted = normalize(want.card_name);
    if (!wanted) return [];
    return listings
      .filter((listing) => normalize(listing.offeredCard).includes(wanted))
      .slice(0, 3);
  }, [listings]);

  return <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white"><div className="mx-auto max-w-6xl"><section className="rounded-[2rem] border border-amber-300/20 bg-[radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.2),transparent_48%),rgba(255,255,255,0.035)] p-8 sm:p-12"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">My Want List</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Keep your next pulls in sight.</h1><p className="mt-4 max-w-2xl text-zinc-300">Save the Pokémon cards you’re hunting, then see when one is actually available on PullTheory.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/search" className="rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-500">ADD CARDS I WANT</Link><Link href="/matches" className="rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-3 font-semibold text-zinc-100">CHECK PULLMATCHES</Link><Link href="/marketplace/browse" className="rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-3 font-semibold text-zinc-100">SHOP MARKETPLACE</Link></div></section>{message && <p className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">{message}</p>}<section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Saved hunts</p><h2 className="mt-2 text-3xl font-semibold">{wants.length} {wants.length === 1 ? "card" : "cards"} wanted</h2></div>{!loading && <button type="button" onClick={() => void load()} className="text-sm font-semibold text-violet-300">Refresh</button>}</div>{loading ? <p className="mt-8 text-zinc-400">Checking your Want List and current marketplace listings…</p> : wants.length ? <div className="mt-7 grid gap-5">{wants.map((want) => { const matches = matchesFor(want); return <article key={want.id} className="overflow-hidden rounded-3xl border border-white/10 bg-black/25"><div className="grid gap-5 p-5 md:grid-cols-[150px_1fr]">{want.image_url ? <img src={want.image_url} alt="" className="aspect-[2.5/3.5] w-full rounded-2xl object-contain bg-black/30" /> : <div className="grid aspect-[2.5/3.5] place-items-center rounded-2xl bg-violet-500/10 text-4xl">🎴</div>}<div><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-2xl font-semibold">{want.card_name}</h3><p className="mt-1 text-sm text-zinc-400">{want.card_set || "Pokémon card"}{want.card_number ? ` · #${want.card_number}` : ""}</p></div><button type="button" onClick={() => void remove(want.id)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-rose-300/40 hover:text-rose-100">Remove</button></div><div className="mt-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">{matches.length ? `${matches.length} matching listing${matches.length === 1 ? "" : "s"} found` : "No matching listing right now"}</p>{matches.length ? <div className="mt-3 grid gap-3">{matches.map((listing) => <Link key={listing.id} href={`/marketplace/${listing.id}`} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-violet-300/40"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold group-hover:text-violet-200">{listing.offeredCard}</p><p className="mt-1 text-xs text-zinc-400">{listing.listingType === "sell" ? "For sale" : listing.listingType === "trade" ? "Trade" : "Trade or sell"}{listing.salePriceCents ? ` · $${(listing.salePriceCents / 100).toFixed(2)}` : ""}</p></div><span className="text-sm font-bold text-violet-300">VIEW →</span></div></Link>)}</div> : <p className="mt-2 text-sm text-zinc-400">Keep it saved. When a matching card is listed, this is where you’ll find it.</p>}</div><div className="mt-5 flex flex-wrap gap-2"><Link href="/marketplace/browse" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold">BROWSE MARKETPLACE</Link><Link href="/matches" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold">PULLMATCHES</Link></div></div></div></article>; })}</div> : <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-10 text-center"><p className="text-2xl font-semibold">Your Want List is empty.</p><p className="mx-auto mt-3 max-w-xl text-zinc-400">Search the Pokémon Card Database and save the cards you’re chasing. Then come back here to check for your next card.</p><Link href="/search" className="mt-6 inline-flex rounded-2xl bg-violet-600 px-5 py-3 font-bold">START A CARD HUNT</Link></div>}</section></div></main>;
}
