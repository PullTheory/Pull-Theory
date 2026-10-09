"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";

type Want = { id: number; card_id?: string | null; card_name: string; card_set?: string | null; card_number?: string | null; image_url?: string | null };

export default function WantListPage() {
  const [wants, setWants] = useState<Want[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true); setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to view your Want List.");
      const response = await fetch("/api/wants", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load your Want List.");
      setWants(data.wants ?? []);
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

  useEffect(() => { void load(); }, []);

  return <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white"><div className="mx-auto max-w-6xl"><section className="rounded-[2rem] border border-amber-300/20 bg-[radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.2),transparent_48%),rgba(255,255,255,0.035)] p-8 sm:p-12"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">My Want List</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Keep your next pulls in sight.</h1><p className="mt-4 max-w-2xl text-zinc-300">Save the Pokémon cards you’re hunting so you have a reason to come back, check new listings, and turn a want into a trade or protected purchase.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/search" className="rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-500">ADD CARDS I WANT</Link><Link href="/matches" className="rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-3 font-semibold text-zinc-100 transition hover:border-violet-300/40">CHECK PULLMATCHES</Link><Link href="/marketplace/browse" className="rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-3 font-semibold text-zinc-100 transition hover:border-emerald-300/40">SHOP MARKETPLACE</Link></div></section>{message && <p className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">{message}</p>}<section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Saved hunts</p><h2 className="mt-2 text-3xl font-semibold">{wants.length} {wants.length === 1 ? "card" : "cards"} wanted</h2></div>{!loading && <button type="button" onClick={() => void load()} className="text-sm font-semibold text-violet-300">Refresh</button>}</div>{loading ? <p className="mt-8 text-zinc-400">Loading your Want List…</p> : wants.length ? <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{wants.map((want) => <article key={want.id} className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">{want.image_url ? <img src={want.image_url} alt="" className="aspect-[2.5/3.5] w-full object-contain bg-black/30" /> : <div className="grid aspect-[2.5/3.5] place-items-center bg-violet-500/10 text-4xl">🎴</div>}<div className="p-5"><h3 className="text-xl font-semibold">{want.card_name}</h3><p className="mt-2 text-sm text-zinc-400">{want.card_set || "Pokémon card"}{want.card_number ? ` · #${want.card_number}` : ""}</p><div className="mt-5 flex gap-2"><Link href="/marketplace/browse" className="flex-1 rounded-xl bg-violet-600 px-3 py-2.5 text-center text-sm font-bold">FIND THIS CARD</Link><button type="button" onClick={() => void remove(want.id)} className="rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-zinc-300 hover:border-rose-300/40 hover:text-rose-100">Remove</button></div></div></article>)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-10 text-center"><p className="text-2xl font-semibold">Your Want List is empty.</p><p className="mx-auto mt-3 max-w-xl text-zinc-400">Search the Pokémon Card Database and save the cards you’re chasing. Then come back here to check for your next card.</p><Link href="/search" className="mt-6 inline-flex rounded-2xl bg-violet-600 px-5 py-3 font-bold">START A CARD HUNT</Link></div>}</section></div></main>;
}
