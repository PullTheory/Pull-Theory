"use client";
import Link from "next/link";

export default function PublicLandingV2(){
  return <main className="min-h-screen bg-[#050506] px-4 py-6 text-white sm:px-6 sm:py-10">
    <div className="mx-auto max-w-6xl">
      <section className="overflow-hidden rounded-[2.25rem] border border-violet-400/30 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,.42),transparent_40%),radial-gradient(circle_at_88%_58%,rgba(251,191,36,.16),transparent_34%),rgba(255,255,255,.035)] px-6 py-12 sm:px-12 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[.22em] text-violet-300 sm:text-sm">Built for Pokémon collectors</p>
          <h1 className="mt-4 text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-7xl">Buy. Sell. Trade. Collect.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">PullTheory is a Pokémon collector marketplace for buying, selling, and trading with <strong>PullShield protection</strong> built in.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link href="/signup" className="rounded-2xl bg-violet-600 px-7 py-4 text-center text-lg font-black shadow-[0_14px_40px_rgba(124,58,237,.42)]">Create Account</Link><Link href="/marketplace/browse" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-center text-lg font-black hover:bg-white/10">Browse Marketplace</Link></div>
          <p className="mt-4 text-sm text-zinc-400">Free to join · Build your collection · Buy, sell, and trade with other collectors</p>
          <p className="mt-5 text-sm text-zinc-400">Already a member? <Link href="/login" className="font-bold text-amber-300">Log in</Link></p>
        </div>
      </section>
      <section className="mx-auto mt-5 grid max-w-4xl gap-3 sm:grid-cols-3"><article className="rounded-2xl border border-white/10 bg-white/[.035] p-5 text-center"><p className="text-2xl">🛡️</p><h2 className="mt-2 font-black">PullShield</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Protection and verification tools designed around safer collector transactions.</p></article><article className="rounded-2xl border border-white/10 bg-white/[.035] p-5 text-center"><p className="text-2xl">🤝</p><h2 className="mt-2 font-black">Buy · Sell · Trade</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Find cards, make offers, sell your extras, and connect with other collectors.</p></article><article className="rounded-2xl border border-white/10 bg-white/[.035] p-5 text-center"><p className="text-2xl">📚</p><h2 className="mt-2 font-black">Build Your Binder</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Track your collection and put cards into the marketplace when you're ready.</p></article></section>
      <section className="mx-auto mt-5 max-w-4xl rounded-[2rem] border border-white/10 bg-white/[.035] p-7 sm:p-9"><p className="text-center text-xs font-black uppercase tracking-[.22em] text-violet-300">Get started</p><h2 className="mt-3 text-center text-3xl font-black sm:text-4xl">Your collection, your marketplace.</h2><p className="mx-auto mt-3 max-w-xl text-center text-zinc-300">Create your free account, build your collection, and start exploring cards from the PullTheory community.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[['1️⃣','Create your account','Join PullTheory and set up your collector profile.'],['2️⃣','Build your collection','Keep track of the cards you own and want.'],['3️⃣','Start trading','Browse listings and connect with other collectors.']].map(([n,h,p])=><article key={h} className="rounded-2xl border border-white/10 bg-black/25 p-5 text-center"><p className="text-2xl">{n}</p><h3 className="mt-2 font-black">{h}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{p}</p></article>)}</div><p className="mt-6 text-center"><Link href="/trust" className="text-sm font-bold text-amber-300">See how PullShield works →</Link></p></section>
      <footer className="px-3 py-7 text-center text-xs text-zinc-600"><div className="flex flex-wrap justify-center gap-4"><Link href="/trust">Trust Center</Link><Link href="/terms">Terms</Link><Link href="/marketplace/browse">Marketplace</Link></div><p className="mt-3">PullTheory · Built for collectors.</p></footer>
    </div>
  </main>;
}
