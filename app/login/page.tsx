"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabase";
import { recordTrafficEvent } from "../components/TrafficTracker";

function requestedDestination() {
  if (typeof window === "undefined") return "/marketplace/browse";
  const requested = new URLSearchParams(window.location.search).get("returnTo");
  return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/marketplace/browse";
}

async function postLoginDestination(fallback: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return fallback;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return fallback;
  try {
    const response = await fetch("/api/welcome-rip", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) return fallback;
    const body = await response.json();
    return body.eligible || body.alreadyClaimed ? "/welcome-rip" : fallback;
  } catch { return fallback; }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [returnTo, setReturnTo] = useState("/marketplace/browse");

  useEffect(() => {
    const destination = requestedDestination();
    setReturnTo(destination);
    async function checkSession() {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (data.session) { void recordTrafficEvent("existing_session_returned"); router.replace(await postLoginDestination(destination)); return; }
      void recordTrafficEvent("login_opened");
    }
    void checkSession();
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    void recordTrafficEvent("login_attempted");
    const supabase = getSupabaseClient();
    if (!supabase) { void recordTrafficEvent("login_failed"); setMessage("Supabase client not available."); setLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { void recordTrafficEvent("login_failed"); setMessage(error.message); setLoading(false); return; }
    void recordTrafficEvent("login_completed");
    router.push(await postLoginDestination(returnTo));
  }

  const signupHref = `/signup?returnTo=${encodeURIComponent(returnTo)}`;
  return <main className="min-h-screen bg-black px-6 py-12 text-white"><div className="mx-auto max-w-md rounded-3xl border border-violet-500/30 bg-white/5 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur"><a href="/" className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">Pull Theory HQ</a><h1 className="mt-8 text-3xl font-semibold">Welcome back.</h1><p className="mt-2 text-zinc-400">Log in to manage your collection and membership.</p><form onSubmit={handleLogin} className="mt-8 space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm text-zinc-300">Email address</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-violet-400" placeholder="you@example.com"/></div><div><label htmlFor="password" className="mb-2 block text-sm text-zinc-300">Password</label><input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-violet-400" placeholder="Your password"/></div>{message && <p className="rounded-xl bg-violet-500/10 p-3 text-sm text-violet-200">{message}</p>}<button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60">{loading ? "Logging in..." : "Log in"}</button></form><p className="mt-6 text-center text-sm text-zinc-400">Don&apos;t have an account? <a href={signupHref} className="font-medium text-amber-300 hover:text-amber-200">Create one</a></p></div></main>;
}
