"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/supabase";

export default function AuthStatus({ variant = "app" }: { variant?: "app" | "home" }) {
  const [user, setUser] = useState<any | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function loadUser() {
      const supabase = getSupabaseClient();
      if (!supabase) { setUser(null); setReady(true); return; }
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setReady(true);

      // The header stays mounted while people move from login to the app.
      // Listen for that sign-in event so the account buttons change instantly.
      const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setReady(true);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    }

    void loadUser();
    return () => unsubscribe?.();
  }, []);

  if (!ready) return <div className="h-10 w-28" aria-hidden="true" />;

  async function signOut() {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  }

  if (!user) {
    return variant === "home" ? (
      <div className="flex items-center gap-3">
        <Link href="/login" className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-violet-400/70 hover:bg-white/10">Login</Link>
        <Link href="/signup" aria-label="Sign up free and create a Pull Theory account" className="rounded-xl border border-violet-200/60 bg-gradient-to-r from-violet-500 via-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-[0_14px_45px_rgba(124,58,237,0.6)] ring-2 ring-violet-300/20 transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-violet-300/60">Sign up free <span aria-hidden="true" className="ml-1">→</span></Link>
      </div>
    ) : <div className="flex gap-3 text-sm"><Link href="/login" className="text-amber-300">Sign in</Link><Link href="/signup" className="text-amber-300">Sign up</Link></div>;
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:border-violet-300/60 hover:bg-white/10">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-500/30 text-xs">{String(user.email ?? "P").slice(0, 1).toUpperCase()}</span>
        Profile <span className="text-zinc-400">⌄</span>
      </button>
      {open && <div className="absolute right-0 top-[calc(100%+0.6rem)] z-[70] w-64 rounded-2xl border border-white/10 bg-[#15121b] p-2 shadow-2xl"><div className="border-b border-white/10 px-3 py-3"><p className="text-xs uppercase tracking-wider text-zinc-500">Signed in as</p><p className="mt-1 truncate text-sm text-white">{user.email}</p></div><Link onClick={() => setOpen(false)} href="/profile" className="mt-2 block rounded-xl px-3 py-2.5 text-sm text-zinc-200 transition hover:bg-white/[0.08]">View profile</Link><Link onClick={() => setOpen(false)} href="/pricing" className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-zinc-200 transition hover:bg-white/[0.08]">Memberships</Link><button type="button" onClick={signOut} className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm text-rose-200 transition hover:bg-rose-400/10">Sign out</button></div>}
    </div>
  );
}
