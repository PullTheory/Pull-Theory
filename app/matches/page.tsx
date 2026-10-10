"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";

type Want = { id: number; card_name: string; card_number?: string | null; card_set?: string | null };
type Listing = {
  id: number;
  offeredCard: string;
  desiredCard: string;
  name: string;
  photoUrls?: string[];
  salePriceCents?: number | null;
  listingType?: "trade" | "sell" | "trade_or_sell";
  created_at?: string | null;
};
type Match = { listing: Listing; want: Want; offeredFromCollection: { card_name: string } };

const money = (cents?: number | null) => cents == null ? null : (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function PullMatchesPage() {
  const [wants, setWants] = useState<Want[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to see your PullMatches.");
      const response = await fetch("/api/pullmatches", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load your PullMatches.");
      setWants(data.wants ?? []);
      setMatches(data.matches ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load your PullMatches.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const uniqueMatches = useMemo(() => {
    const seen = new Set<string>();
    return matches.filter((match) => {
      const key = `${match.listing.id}:${match.want.id}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }, [matches]);

  return (
    <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-emerald-300/25 bg-[radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.22),transparent_48%),rgba(255,255,255,0.035)] p-8 sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">🔥 Your hunt</p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">{loading ? "Finding your matches…" : `${uniqueMatches.length} match${uniqueMatches.length === 1 ? "" : "es"} found.`}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">PullMatches connects cards on your Want List with active collector listings that also want a card you own. Come back whenever your hunt changes.</p>
            </div>
            <button type="button" onClick={() => void load()} className="rounded-2xl border border-white/15 bg-black/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Refresh hunt</button>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/wants" className="rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-500">Manage Want List</Link>
            <Link href="/marketplace/browse" className="rounded-2xl border border-white/15 px-5 py-3 font-bold text-white hover:bg-white/10">Browse Marketplace</Link>
          </div>
        </section>

        {message && <p className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-rose-100">{message}</p>}

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Your Want List</p><h2 className="mt-2 text-2xl font-semibold">What you&apos;re hunting</h2></div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-zinc-300">{wants.length} saved</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {wants.length ? wants.map((want) => <span key={want.id} className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-zinc-200">{want.card_name}{want.card_number ? ` #${want.card_number}` : ""}</span>) : <div><p className="text-zinc-400">Your hunt is quiet because your Want List is empty.</p><Link href="/search" className="mt-4 inline-flex text-sm font-bold text-violet-300">Add your first wanted card →</Link></div>}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Live opportunities</p><h2 className="mt-2 text-3xl font-semibold">Cards worth checking now</h2></div>
          {loading ? <p className="text-zinc-400">Comparing your hunt with active listings…</p> : uniqueMatches.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {uniqueMatches.map((match) => {
              const price = money(match.listing.salePriceCents);
              const photo = match.listing.photoUrls?.[0];
              return <article key={`${match.listing.id}-${match.want.id}`} className="overflow-hidden rounded-3xl border border-emerald-300/20 bg-emerald-400/[0.05]">
                {photo ? <img src={photo} alt={match.listing.offeredCard} className="h-56 w-full object-cover" /> : <div className="flex h-56 items-center justify-center bg-black/25 text-5xl">🎴</div>}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3"><span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">MATCH</span><span className="text-xs text-zinc-500">From your Want List</span></div>
                  <h3 className="mt-4 text-xl font-semibold">{match.listing.offeredCard}</h3>
                  <p className="mt-2 text-sm text-zinc-300">You want this card. The collector listing it is looking for <span className="font-semibold text-white">{match.listing.desiredCard}</span>, which you own.</p>
                  <div className="mt-5 flex items-center justify-between gap-3 text-sm"><span className="text-zinc-400">{match.listing.listingType === "trade_or_sell" ? "Trade or sale" : match.listing.listingType === "sell" ? "Protected sale" : "Trade listing"}</span>{price && <span className="font-bold text-emerald-200">{price}</span>}</div>
                  <Link href={`/marketplace/${match.listing.id}`} className="mt-5 inline-flex w-full justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-500">SEE MATCH →</Link>
                </div>
              </article>;
            })}
          </div> : <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center"><p className="text-lg font-semibold text-white">Your hunt is quiet.</p><p className="mx-auto mt-2 max-w-xl text-zinc-400">Add three cards you really want. When another collector lists one and wants a card you own, PullTheory will surface the opportunity here.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/search" className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white">ADD CARDS TO WANT LIST</Link><Link href="/wants" className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white">VIEW WANT LIST</Link></div></div>}
        </section>
      </div>
    </main>
  );
}
