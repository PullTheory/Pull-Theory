"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function CollectionSellingPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "", size: "", estimatedValue: "", preferredContact: "email", details: "", photos: "", agree: false, website: "" });
  function update(key: string, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setSent(false);
    try {
      const response = await fetch("/api/collection-inquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photos: form.photos.split("\n").map((item) => item.trim()).filter(Boolean) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your inquiry.");
      setSent(true);
      setForm({ name: "", email: "", phone: "", location: "", size: "", estimatedValue: "", preferredContact: "email", details: "", photos: "", agree: false, website: "" });
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  const field = "mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-violet-400";
  const label = "block text-sm font-bold text-zinc-300";
  return <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <Link href="/sell" className="text-sm font-bold text-violet-300 hover:text-white">← Back to selling cards</Link>
      <section className="mt-7 rounded-[2rem] border border-violet-300/20 bg-[radial-gradient(circle_at_10%_0%,rgba(124,58,237,.28),transparent_42%),rgba(255,255,255,.035)] p-6 sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">Collection selling desk</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.045em] sm:text-6xl">Thinking about selling your Pokémon collection?</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">Tell PullTheory what you have. We’ll review the information and contact you to discuss possible next steps. You keep possession of your cards unless and until you separately agree to written terms.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            ["01", "Share the basics", "Tell us roughly what you own and where you’re located."],
            ["02", "We review", "We may ask for clearer photos, set names, grades, or additional details."],
            ["03", "Discuss options", "If it’s a fit, we’ll discuss a possible selling arrangement and all fees before you decide."],
          ].map(([number, title, description]) => <article key={number} className="rounded-2xl border border-white/10 bg-black/25 p-5"><p className="text-xs font-black tracking-[.2em] text-violet-300">{number}</p><h2 className="mt-3 font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></article>)}
        </div>
      </section>

      <form onSubmit={submit} className="mt-6 rounded-[2rem] border border-white/10 bg-white/[.035] p-6 sm:p-10">
        <h2 className="text-2xl font-black">Tell us about your collection</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">No payment, shipping, or commitment is required to submit this inquiry. Your answers and any photo links you provide are emailed to PullTheory so we can review and respond; do not include passwords, payment details, or sensitive personal information.</p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className={label}>Your name<input className={field} required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Name" /></label>
          <label className={label}>Email address<input className={field} required type="email" maxLength={160} autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" /></label>
          <label className={label}>Phone (optional)<input className={field} type="tel" maxLength={50} autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone number" /></label>
          <label className={label}>City / State<input className={field} maxLength={120} autoComplete="address-level2" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Elkton, KY" /></label>
          <label className={label}>How large is the collection?<select className={field} required value={form.size} onChange={(e) => update("size", e.target.value)}><option value="">Choose one</option><option>Under 100 cards</option><option>100–500 cards</option><option>500–2,000 cards</option><option>2,000+ cards</option><option>Mostly sealed products</option><option>Mixed collection / not sure</option></select></label>
          <label className={label}>Estimated collection value (optional)<select className={field} value={form.estimatedValue} onChange={(e) => update("estimatedValue", e.target.value)}><option value="">Not sure</option><option>Under $250</option><option>$250–$1,000</option><option>$1,000–$5,000</option><option>$5,000–$10,000</option><option>$10,000+</option></select></label>
          <label className={label}>How should we contact you?<select className={field} value={form.preferredContact} onChange={(e) => update("preferredContact", e.target.value)}><option value="email">Email</option><option value="text">Text</option><option value="phone">Phone call</option></select></label>
          <label className={label}>Photo links (optional)<textarea className={field} rows={3} value={form.photos} onChange={(e) => update("photos", e.target.value)} placeholder="Paste links to photos, one per line" /></label>
          <label className={label + " sm:col-span-2"}>Tell us what you have<textarea className={field} required minLength={20} maxLength={2500} rows={6} value={form.details} onChange={(e) => update("details", e.target.value)} placeholder="Sets, rare cards, PSA/BGS/CGC slabs, sealed products, condition, what you hope to do, and anything else we should know..." /></label>
        </div>
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} /></label></div>
        <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-zinc-300"><input type="checkbox" required checked={form.agree} onChange={(e) => update("agree", e.target.checked)} className="mt-1 h-4 w-4 accent-violet-500" /><span>I agree that this is an inquiry only. I understand PullTheory has not agreed to buy, appraise, authenticate, or take possession of my cards, and any selling arrangement and fees must be agreed to separately in writing.</span></label>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}
        {sent && <p role="status" className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">Your inquiry was sent. PullTheory will review it and follow up using your preferred contact method.</p>}
        <button type="submit" disabled={busy} className="mt-7 w-full rounded-xl bg-violet-600 px-6 py-4 font-black transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Sending inquiry…" : "Submit collection inquiry"}</button>
        <p className="mt-4 text-center text-xs text-zinc-500">Please do not mail cards or share payment details. Never send your collection before receiving and accepting written terms.</p>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">Questions? <a href="mailto:PullTheory@gmail.com" className="font-bold text-violet-300">Email PullTheory</a></p>
    </div>
  </main>;
}
