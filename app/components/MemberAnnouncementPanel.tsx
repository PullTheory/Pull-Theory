"use client";

import { useEffect, useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";

const defaultSubject = "PullTheory Just Got a Major Upgrade";
const defaultMessage = `PullTheory is growing — and the marketplace just got a major upgrade.\n\nYou can now Buy, Sell, or Trade Pokemon cards through PullTheory with PullShield protection built into the transaction.\n\nPULLSHIELD VERIFICATION\nCards are sent to PullTheory for authentication before the transaction is completed, helping protect both collectors.\n\nNEW MEMBERSHIP OPTIONS\nChoose Collector, Trader, Pro, or Elite. Higher memberships include PullShield authentications and lower fees.\n\nTRADING IS STILL HERE\nCard-for-card trading remains a core part of PullTheory, including PullMatch and protected trade tracking.\n\nBUYING & SELLING IS NOW AVAILABLE\nCollectors can list cards for sale or purchase cards from other collectors while PullShield helps protect the transaction.\n\nThis is only the beginning. Thank you for being one of the early collectors helping build PullTheory.\n\nVisit PullTheoryTrade.com and check out the update.\n\n— PullTheory\nCollect. Trade. Buy. Sell. Protected by PullShield.`;

export default function MemberAnnouncementPanel() {
  const [subject, setSubject] = useState(defaultSubject);
  const [text, setText] = useState(defaultMessage);
  const [audience, setAudience] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { void loadAudience(); }, []);
  async function loadAudience() {
    try {
      const token = await getCurrentAccessToken(); if (!token) return;
      const response = await fetch("/api/pullshield/member-email", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json(); if (response.ok) setAudience(data.eligible ?? 0);
    } catch { /* desk remains usable */ }
  }
  async function send() {
    const count = audience ?? 0;
    if (!window.confirm(`Send this announcement to ${count} eligible PullTheory member${count === 1 ? "" : "s"}?`)) return;
    setSending(true); setMessage("");
    try {
      const token = await getCurrentAccessToken(); if (!token) throw new Error("Please sign in again.");
      const response = await fetch("/api/pullshield/member-email", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ subject, text }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to send announcement.");
      setMessage(`Sent to ${data.sent} member${data.sent === 1 ? "" : "s"}.${data.failed ? ` ${data.failed} failed.` : ""}`);
      await loadAudience();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to send announcement."); }
    finally { setSending(false); }
  }
  return <section className="mt-8 rounded-3xl border border-violet-400/20 bg-violet-500/[0.07] p-6">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Member announcements</p>
    <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-semibold">Email PullTheory members</h2><p className="mt-2 text-sm text-zinc-300">Confirmed members only. Marketing opt-outs are automatically excluded.</p></div><p className="rounded-xl bg-black/20 px-4 py-2 text-sm text-violet-100">{audience === null ? "Loading audience..." : `${audience} eligible recipients`}</p></div>
    <label className="mt-5 block text-sm font-semibold text-zinc-200">Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={140} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet-400" /></label>
    <label className="mt-4 block text-sm font-semibold text-zinc-200">Message<textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet-400" /></label>
    <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={() => void send()} disabled={sending || !subject.trim() || !text.trim() || audience === 0} className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sending..." : "Send announcement"}</button><p className="text-xs text-zinc-400">You’ll get a confirmation before anything is sent.</p></div>
    {message && <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-200">{message}</p>}
  </section>;
}
