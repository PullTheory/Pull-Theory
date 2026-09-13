"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";
import { recordTrafficEvent } from "../components/TrafficTracker";

type Prize = {
  prize_id?: string;
  id?: string;
  tier: "bulk" | "nice" | "good" | "big" | "chase";
  display_name: string;
  value_min_cents: number;
  value_max_cents: number;
  card_name?: string | null;
  card_set?: string | null;
  card_number?: string | null;
  image_url?: string | null;
  claimed_at?: string;
};
type Status = { eligible: boolean; confirmed: boolean; alreadyClaimed: boolean; prize: Prize | null; remaining: number; chaseRemaining: number; active: boolean };

const tierCopy = {
  bulk: { label: "Mystery Pull", emoji: "✨", className: "border-zinc-500/40 bg-zinc-500/10 text-zinc-100" },
  nice: { label: "Nice Pull", emoji: "⚡", className: "border-sky-400/40 bg-sky-500/10 text-sky-100" },
  good: { label: "Good Hit", emoji: "🔥", className: "border-violet-400/50 bg-violet-500/15 text-violet-100" },
  big: { label: "BIG HIT", emoji: "💥", className: "border-amber-300/60 bg-amber-300/15 text-amber-100" },
  chase: { label: "CHASE HIT", emoji: "🏆", className: "border-amber-200 bg-[radial-gradient(circle_at_top,rgba(251,191,36,.32),rgba(124,58,237,.18),rgba(0,0,0,.5))] text-amber-50 shadow-[0_0_60px_rgba(251,191,36,.22)]" },
};

function dollars(cents: number) { return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`; }
function valueLabel(prize: Prize) { return prize.value_min_cents === prize.value_max_cents ? dollars(prize.value_min_cents) : `${dollars(prize.value_min_cents)}–${dollars(prize.value_max_cents)}`; }

export default function WelcomeRipPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");

  async function request(method: "GET" | "POST") {
    const token = await getCurrentAccessToken();
    if (!token) throw new Error("Sign in to open your Welcome Rip.");
    const response = await fetch("/api/welcome-rip", { method, headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Welcome Rip is unavailable.");
    return body;
  }

  useEffect(() => { (async () => { try { const body = await request("GET"); setStatus(body); setRevealed(Boolean(body.prize)); void recordTrafficEvent("welcome_rip_opened"); } catch (e) { setError(e instanceof Error ? e.message : "Welcome Rip is unavailable."); } finally { setLoading(false); } })(); }, []);

  async function openRip() {
    setOpening(true); setError(""); void recordTrafficEvent("welcome_rip_claim_started");
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const body = await request("POST");
      setStatus((current) => current ? { ...current, prize: body.prize, alreadyClaimed: true, remaining: body.remaining, chaseRemaining: body.chaseRemaining } : current);
      setRevealed(true); void recordTrafficEvent(`welcome_rip_revealed_${body.prize?.tier || "unknown"}`);
    } catch (e) { setError(e instanceof Error ? e.message : "We couldn't open your Welcome Rip."); }
    finally { setOpening(false); }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-black text-white"><p className="animate-pulse text-zinc-400">Loading your Welcome Rip…</p></main>;

  const prize = status?.prize;
  const tier = prize ? tierCopy[prize.tier] : null;
  return <main className="min-h-screen overflow-hidden bg-[#050506] px-5 py-10 text-white"><div className="mx-auto max-w-2xl text-center">
    <Link href="/" className="text-xs font-black uppercase tracking-[.24em] text-violet-300">PullTheory</Link>
    <p className="mt-8 text-xs font-black uppercase tracking-[.24em] text-amber-300">New collector launch</p>
    <h1 className="mt-3 text-5xl font-black tracking-[-.05em] sm:text-6xl">Your Welcome Rip.</h1>
    <p className="mx-auto mt-4 max-w-xl leading-7 text-zinc-300">Every eligible new collector gets one free digital rip. Your result locks one real mystery card from the 100-card launch pool.</p>

    {status && <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-3xl font-black">{status.remaining}</p><p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">Rips remaining</p></div><div className="rounded-2xl border border-amber-300/25 bg-amber-300/[.07] p-4"><p className="text-3xl font-black text-amber-200">{status.chaseRemaining}</p><p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">Chase hits left</p></div></div>}

    <section className={`relative mx-auto mt-7 min-h-[390px] max-w-md overflow-hidden rounded-[2.25rem] border p-7 transition-all duration-700 ${tier ? tier.className : "border-violet-400/35 bg-[radial-gradient(circle_at_top,rgba(124,58,237,.32),rgba(0,0,0,.5))]"}`}>
      {!revealed ? <div className="flex min-h-[330px] flex-col items-center justify-center"><div className={`flex h-36 w-28 items-center justify-center rounded-2xl border-2 border-violet-300/50 bg-violet-600/20 text-5xl shadow-[0_0_50px_rgba(124,58,237,.35)] ${opening ? "animate-pulse scale-110" : ""}`}>?</div><h2 className="mt-7 text-2xl font-black">{opening ? "Ripping…" : "One pull. One real card."}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">The card is selected securely on the server and can only be claimed once.</p>{status?.eligible ? <button type="button" onClick={openRip} disabled={opening} className="mt-6 w-full rounded-2xl bg-violet-600 px-6 py-4 text-lg font-black transition hover:bg-violet-500 disabled:opacity-60">{opening ? "Opening your rip…" : "OPEN MY FREE RIP"}</button> : <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">{!status?.confirmed ? "Confirm your email first, then come back to open your rip." : status?.active ? "This launch is for new accounts created after the Welcome Rip went live." : "The Welcome Rip promotion is currently closed."}</div>}</div> : prize && tier ? <div className="flex min-h-[330px] flex-col items-center justify-center"><div className="text-7xl">{tier.emoji}</div><p className="mt-5 text-xs font-black uppercase tracking-[.25em] opacity-80">{tier.label}</p><h2 className="mt-2 text-3xl font-black">{prize.card_name || prize.display_name}</h2>{prize.card_set && <p className="mt-2 text-sm opacity-75">{prize.card_set}{prize.card_number ? ` · #${prize.card_number}` : ""}</p>}<p className="mt-5 text-sm uppercase tracking-widest opacity-70">Mystery card value range</p><p className="mt-1 text-4xl font-black">{valueLabel(prize)}</p><p className="mt-5 max-w-sm text-sm leading-6 opacity-75">Your pull is locked to your account. PullTheory will match this claim to the physical card before fulfillment.</p><Link href="/binders" className="mt-6 w-full rounded-2xl bg-white px-6 py-4 font-black text-black">Continue to PullTheory</Link></div> : null}
    </section>

    {error && <p className="mx-auto mt-5 max-w-md rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</p>}
    <p className="mx-auto mt-6 max-w-xl text-xs leading-5 text-zinc-600">One Welcome Rip per eligible new account, while the 100-card pool lasts. Displayed value is the assigned prize range; actual market values can change. No purchase necessary.</p>
  </div></main>;
}
