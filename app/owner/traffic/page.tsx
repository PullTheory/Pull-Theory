"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCurrentAccessToken } from "../../lib/supabase";

type TrafficData = {
  today: number;
  week: number;
  allTime: number;
  pageViews: number;
  daily: Array<{ label: string; visitors: number }>;
  pages: Array<{ path: string; views: number; visitors: number }>;
  onePageVisitors: number;
  funnel: Array<{ id: string; label: string; visitors: number }>;
  signupDiagnostics: Array<{ id: string; label: string; visitors: number }>;
  loginDiagnostics: Array<{ id: string; label: string; visitors: number }>;
};
type Snapshot = {
  traffic: TrafficData;
  signups: { today: number; week: number; allTime: number } | null;
  lifecycle: Array<{ id: string; label: string; members: number }> | null;
  generatedAt: string;
};

function Metric({ label, value, detail }: { label: string; value: number | string; detail: string }) {
  return <article className="rounded-2xl border border-white/10 bg-[#111a2b] p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">{label}</p><p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p><p className="mt-2 text-xs text-slate-400">{detail}</p></article>;
}

export default function OwnerTrafficPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Your owner session expired. Sign in again, then reopen Owner Tools.");
      const response = await fetch("/api/owner/traffic", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load traffic.");
      setSnapshot(data);
      setLastUpdated(new Date(data.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load traffic.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(true), 30000);
    const onFocus = () => void load(true);
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [load]);

  const maxDaily = useMemo(() => Math.max(1, ...(snapshot?.traffic.daily.map(day => day.visitors) ?? [])), [snapshot]);
  const maxPage = useMemo(() => Math.max(1, ...(snapshot?.traffic.pages.map(page => page.views) ?? [])), [snapshot]);

  return (
    <main className="min-h-screen bg-[#080f1c] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="rounded-[2rem] border border-emerald-300/15 bg-[radial-gradient(circle_at_85%_0%,rgba(16,185,129,.16),transparent_38%),#101a2a] p-6 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div><p className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">Private owner tools</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Traffic & Analytics</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">A dedicated view of visitors, page activity, sign-ups, and the points where shoppers leave the journey.</p></div>
            <div className="flex flex-wrap gap-2"><Link href="/pullshield" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-white/5">PullShield Desk</Link><button onClick={() => void load(true)} disabled={refreshing || loading} className="rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-emerald-200 disabled:opacity-50">{refreshing ? "Refreshing…" : "Refresh now"}</button></div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400"><span>Auto-refreshes every 30 seconds</span><span>{lastUpdated ? `Last updated ${lastUpdated}` : "Waiting for first load"}</span><span>Private to the owner account</span></div>
        </header>

        {error && <section role="alert" className="rounded-2xl border border-rose-300/25 bg-rose-400/10 p-5"><p className="font-bold text-rose-100">Analytics unavailable</p><p className="mt-2 text-sm leading-6 text-rose-100/80">{error}</p><button onClick={() => void load()} className="mt-4 rounded-xl border border-rose-200/30 px-4 py-2 text-sm font-bold text-rose-100">Try again</button></section>}

        {loading && !snapshot ? <div className="rounded-2xl border border-white/10 bg-white/[.04] p-10 text-center text-slate-300">Loading your traffic dashboard…</div> : snapshot ? <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Visitors today" value={snapshot.traffic.today} detail="Unique anonymous visitors today" />
            <Metric label="Visitors · 7 days" value={snapshot.traffic.week} detail="Unique visitors over the last 7 days" />
            <Metric label="All-time visitors" value={snapshot.traffic.allTime} detail="Unique visitors in the stored activity log" />
            <Metric label="Page views" value={snapshot.traffic.pageViews} detail="Recorded page visits, excluding funnel events" />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
            <article className="rounded-3xl border border-white/10 bg-[#101a2a] p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Audience trend</p><h2 className="mt-2 text-2xl font-bold">Daily visitors</h2></div><p className="text-xs text-slate-400">Last 7 days</p></div><div className="mt-8 grid h-52 grid-cols-7 items-end gap-2 sm:gap-4">{snapshot.traffic.daily.map((day, i) => <div key={`${day.label}-${i}`} className="flex h-full flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-slate-200">{day.visitors}</span><div className="flex w-full flex-1 items-end overflow-hidden rounded-t-lg bg-white/[.04]"><div className="w-full rounded-t-lg bg-emerald-300" style={{ height: `${Math.max(3, day.visitors / maxDaily * 100)}%` }} /></div><span className="text-[11px] text-slate-400">{day.label}</span></div>)}</div></article>
            <article className="rounded-3xl border border-white/10 bg-[#101a2a] p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Engagement signal</p><h2 className="mt-2 text-2xl font-bold">Single-page visitors</h2><p className="mt-2 text-sm text-slate-400">Visitors recorded on only one page. This is a navigation signal, not proof that they immediately left.</p><p className="mt-6 text-5xl font-black">{snapshot.traffic.onePageVisitors}</p><p className="mt-2 text-xs text-slate-400">Unique visitors in the current activity sample</p><div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">Use this alongside your most-viewed pages and sign-up funnel to spot where the shopping journey needs improvement.</div></article>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#101a2a] p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Content performance</p><h2 className="mt-2 text-2xl font-bold">Most-viewed pages</h2></div><p className="text-xs text-slate-400">Sorted by page views</p></div><div className="mt-6 space-y-4">{snapshot.traffic.pages.map(page => <div key={page.path}><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="max-w-[70%] truncate font-semibold">{page.path}</span><span className="text-slate-300">{page.views} views · {page.visitors} visitors</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${page.views / maxPage * 100}%` }} /></div></div>)}{!snapshot.traffic.pages.length && <p className="text-sm text-slate-400">No page activity has been recorded yet.</p>}</div></section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-[#101a2a] p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Conversion</p><h2 className="mt-2 text-2xl font-bold">Sign-up funnel</h2><p className="mt-2 text-sm text-slate-400">Unique anonymous visitors at each tracked step.</p><div className="mt-5 space-y-3">{snapshot.traffic.funnel.map((step, index) => <div key={step.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 p-4"><span className="text-sm text-slate-200">{index + 1}. {step.label}</span><strong className="text-xl text-emerald-200">{step.visitors}</strong></div>)}</div></article>
            <article className="rounded-3xl border border-white/10 bg-[#101a2a] p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Account growth</p><h2 className="mt-2 text-2xl font-bold">New sign-ups</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{snapshot.signups ? <><Metric label="Today" value={snapshot.signups.today} detail="New accounts" /><Metric label="7 days" value={snapshot.signups.week} detail="New accounts" /><Metric label="All time" value={snapshot.signups.allTime} detail="Registered accounts" /></> : <p className="text-sm text-slate-400">Sign-up counts are unavailable.</p>}</div></article>
          </section>

          {snapshot.traffic.signupDiagnostics.length > 0 && <section className="rounded-3xl border border-white/10 bg-[#101a2a] p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Troubleshooting</p><h2 className="mt-2 text-2xl font-bold">Sign-up form diagnostics</h2><p className="mt-2 text-sm text-slate-400">Shows tracked form milestones and errors, so we can see where sign-ups get stuck.</p><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{snapshot.traffic.signupDiagnostics.filter(x => x.visitors > 0).map(step => <div key={step.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-slate-400">{step.label}</p><p className="mt-1 text-2xl font-bold">{step.visitors}</p></div>)}</div></section>}

          {snapshot.lifecycle && <section className="rounded-3xl border border-white/10 bg-[#101a2a] p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Retention</p><h2 className="mt-2 text-2xl font-bold">Member lifecycle</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{snapshot.lifecycle.map(step => <div key={step.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-slate-400">{step.label}</p><p className="mt-2 text-2xl font-bold">{step.members}</p></div>)}</div></section>}
        </> : null}
      </div>
    </main>
  );
}
