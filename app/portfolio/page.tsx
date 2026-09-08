"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabase";

type Card = { id: string; card_id?: string; card_name: string; card_set?: string; card_number?: string; rarity?: string; language?: string; quantity_owned?: number; current_market_value?: string | number; price?: string | number; image_url?: string };

function valueOf(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const number = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(number) ? number : 0;
  }
  return 0;
}

const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function PortfolioPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const supabase = getSupabaseClient();
        const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
        const response = await fetch("/api/collection", { headers: data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {} });
        const result = await response.json();
        if (response.ok) setCards(result.cards ?? []);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  const valuedCards = useMemo(() => cards.map((card) => ({ ...card, unitValue: valueOf(card.current_market_value ?? card.price), totalValue: valueOf(card.current_market_value ?? card.price) * (card.quantity_owned ?? 1) })).sort((a, b) => b.totalValue - a.totalValue), [cards]);
  const portfolioValue = valuedCards.reduce((total, card) => total + card.totalValue, 0);
  const totalCards = cards.reduce((total, card) => total + (card.quantity_owned ?? 1), 0);

  if (!loading && cards.length === 0) {
    return <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white"><div className="mx-auto max-w-4xl"><section className="rounded-[2rem] border border-violet-400/25 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.3),transparent_48%),rgba(255,255,255,0.035)] p-8 text-center shadow-[0_30px_90px_rgba(76,29,149,0.18)] sm:p-14"><p className="text-5xl">🎴</p><p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">My Collection</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Let&apos;s start your trade loop.</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">Add what you have. Add what you want. Then let Pull Theory look for a real match.</p><div className="mt-8 grid gap-3 text-left sm:grid-cols-3"><button type="button" onClick={() => router.push("/search")} className="rounded-2xl border border-violet-300/40 bg-violet-500/[0.12] p-5 transition hover:bg-violet-500/[0.2]"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Cards I have</span><span className="mt-2 block font-bold text-white">Add cards you own and would trade.</span></button><button type="button" onClick={() => router.push("/search")} className="rounded-2xl border border-amber-300/35 bg-amber-300/[0.08] p-5 transition hover:bg-amber-300/[0.14]"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Cards I want</span><span className="mt-2 block font-bold text-white">Tell Pull Theory what you&apos;re hunting.</span></button><button type="button" onClick={() => router.push("/matches")} className="rounded-2xl border border-emerald-300/35 bg-emerald-400/[0.08] p-5 transition hover:bg-emerald-400/[0.14]"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">🔥 Find my PullMatches</span><span className="mt-2 block font-bold text-white">See real trade opportunities.</span></button></div><div className="mt-10 grid gap-3 text-left sm:grid-cols-3"><p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300"><span className="block font-bold text-white">1. Search</span>Find your card by name or number.</p><p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300"><span className="block font-bold text-white">2. Add details</span>Choose condition and quantity.</p><p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300"><span className="block font-bold text-white">3. Trade when ready</span>List it directly from your collection.</p></div></section></div></main>;
  }

  function startListing(card: Card) {
    window.sessionStorage.setItem("pull-theory-listing-draft", JSON.stringify({
      cardName: card.card_name,
      selectedCard: true,
      details: {
        setName: card.card_set ?? "",
        cardNumber: card.card_number ?? "",
        estimatedValue: String(card.current_market_value ?? card.price ?? ""),
      },
      imageUrl: card.image_url ?? "",
      rarity: card.rarity ?? "",
    }));
    router.push("/marketplace/list");
  }

  async function deleteCard(card: Card) {
    if (!window.confirm(`Remove ${card.card_name} from your portfolio? This cannot be undone.`)) return;
    setDeletingId(card.id);
    setMessage("");
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/collection", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
        },
        body: JSON.stringify({ id: card.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to remove this card.");
      setCards((current) => current.filter((item) => item.id !== card.id));
      setMessage(`${card.card_name} was removed from your portfolio.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove this card.");
    } finally {
      setDeletingId(null);
    }
  }

  return <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white"><div className="mx-auto max-w-6xl"><section className="rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_82%_0%,rgba(124,58,237,0.26),transparent_48%),rgba(255,255,255,0.035)] p-8 sm:p-12"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">My Collection</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Build the trade loop.</h1><div className="mt-8 grid gap-4 lg:grid-cols-3"><button type="button" onClick={() => router.push("/search")} className="rounded-3xl border border-violet-300/40 bg-violet-500/[0.12] p-6 text-left transition hover:bg-violet-500/[0.2]"><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Cards I have</p><p className="mt-3 text-xl font-bold">Add cards you own and would trade.</p><p className="mt-3 text-sm text-zinc-300">Search the Pokémon Card Database →</p></button><button type="button" onClick={() => router.push("/search")} className="rounded-3xl border border-amber-300/35 bg-amber-300/[0.08] p-6 text-left transition hover:bg-amber-300/[0.14]"><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Cards I want</p><p className="mt-3 text-xl font-bold">Tell Pull Theory what you&apos;re hunting.</p><p className="mt-3 text-sm text-zinc-300">Add cards to your Want List →</p></button><button type="button" onClick={() => router.push("/matches")} className="rounded-3xl border border-emerald-300/35 bg-emerald-400/[0.08] p-6 text-left transition hover:bg-emerald-400/[0.14]"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">🔥 Find my PullMatches</p><p className="mt-3 text-xl font-bold">See collectors whose listings fit your cards.</p><p className="mt-3 text-sm text-zinc-300">View real trade opportunities →</p></button></div><div className="mt-10 grid gap-4 sm:grid-cols-3"><Metric label="Portfolio value" value={money(portfolioValue)} /><Metric label="Cards owned" value={String(totalCards)} /><Metric label="Tracked cards" value={String(cards.length)} /></div></section><section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7"><div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Collection breakdown</p><h2 className="mt-2 text-2xl font-semibold">Your most valuable cards</h2></div><p className="text-sm text-zinc-400">Updates when cards are added</p></div>{message && <p className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">{message}</p>}<div className="mt-6 space-y-3">{loading ? <p className="text-zinc-400">Calculating your portfolio...</p> : valuedCards.length ? valuedCards.map((card) => <div key={card.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4">{card.image_url ? <img src={card.image_url} alt="" className="h-14 w-11 rounded-lg object-cover" /> : <div className="h-14 w-11 rounded-lg bg-violet-500/15" />}<div className="min-w-0 flex-1"><p className="truncate font-semibold">{card.card_name}</p><p className="mt-1 text-sm text-zinc-400">{card.card_set ?? "Unsorted"} · Qty {card.quantity_owned ?? 1}</p></div><p className="font-semibold text-emerald-200">{money(card.totalValue)}</p><button type="button" onClick={() => startListing(card)} className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-500">List for trade or sale</button><button type="button" disabled={deletingId === card.id} onClick={() => void deleteCard(card)} className="rounded-xl border border-rose-300/40 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/10 disabled:opacity-50">{deletingId === card.id ? "Removing..." : "Delete"}</button></div>) : <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-zinc-400">Your portfolio starts at $0. Add cards from the Pokémon Card Database to begin tracking value.</div>}</div></section></div></main>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-5"><p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></div>;
}
