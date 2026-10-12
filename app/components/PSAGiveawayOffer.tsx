"use client";

import { useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";

export default function PSAGiveawayOffer() {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function checkout() {
    setBusy(true);
    setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Sign in first.");
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: "trader", welcomeOffer: true }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Unable to start checkout.");
      window.location.href = result.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start checkout.");
      setBusy(false);
    }
  }

  return <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto bg-black/95 p-5 backdrop-blur-md">
    <div className="w-full max-w-2xl rounded-[2rem] border border-amber-300/30 bg-gradient-to-b from-zinc-950 via-black to-violet-950/40 p-7 text-center shadow-[0_0_100px_rgba(245,158,11,0.15)] sm:p-12">
      <p className="text-sm font-black uppercase tracking-[.3em] text-amber-300">🎉 You just ripped your free pack!</p>
      <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">You could win <span className="text-amber-300">ALL 5 PSA slabs.</span></h2>
      <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-zinc-300">PullTheory is giving away all 5 PSA slabs shown in our giveaway on <strong className="text-white">11/11/2026</strong>.</p>
      <div className="mx-auto mt-7 max-w-md rounded-2xl border border-violet-300/25 bg-violet-500/10 p-6">
        <p className="text-xs font-black uppercase tracking-[.2em] text-violet-200">Your one-time offer</p>
        <p className="mt-3 text-6xl font-black text-white">$7.99</p>
        <p className="mt-1 text-sm text-zinc-400">per month</p>
        <p className="mt-4 text-sm font-semibold text-amber-200">Regular price: $9.99/month</p>
      </div>
      <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-zinc-400">Sign up now and qualify for the PSA Giveaway. This special $7.99 membership offer is available once after your Welcome Rip.</p>
      <button disabled={busy} onClick={() => void checkout()} className="mt-7 w-full rounded-2xl bg-violet-600 px-6 py-5 text-lg font-black shadow-xl shadow-violet-950/50 transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60">{busy ? "OPENING SECURE CHECKOUT…" : "YES — GET THE $7.99 MEMBERSHIP"}</button>
      <button disabled={busy} onClick={() => setOpen(false)} className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-zinc-300 hover:bg-white/10">No thanks — I'll pass on this one-time offer</button>
      {message && <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{message}</p>}
      <p className="mt-5 text-[11px] leading-5 text-zinc-600">Giveaway drawing: 11/11/2026. Membership eligibility and giveaway terms apply.</p>
    </div>
  </div>;
}
