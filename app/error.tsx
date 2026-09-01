"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050506]/80 px-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-rose-300/20 bg-white/[0.04] p-8 text-center shadow-2xl shadow-rose-950/20 backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-200">Pull Theory HQ</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Something didn’t load.</h1>
        <p className="mt-4 text-zinc-300">Your information has not been changed. Try the page again, or return to the marketplace.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500">Try again</button>
          <Link href="/marketplace/browse" className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-zinc-100 transition hover:bg-white/10">Marketplace</Link>
        </div>
      </section>
    </main>
  );
}
