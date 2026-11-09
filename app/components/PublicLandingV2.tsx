"use client";
import Link from "next/link";

export default function PublicLandingV2(){
  return <main className="min-h-screen bg-[#050506] px-4 py-6 text-white sm:px-6 sm:py-10">
    <div className="mx-auto max-w-6xl">
      <section className="overflow-hidden rounded-[2.25rem] border border-violet-400/30 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,.42),transparent_40%),radial-gradient(circle_at_88%_58%,rgba(251,191,36,.16),transparent_34%),rgba(255,255,255,.035)] px-6 py-12 sm:px-12 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[.22em] text-violet-300 sm:text-sm">The Pokémon collector marketplace</p>
          <h1 className="mt-4 text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-7xl">Your cards. Your next move.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">Buy, sell, and trade Pokémon cards with a collector-first community. Find your next chase card, list cards you’re ready to move, and use PullShield tools for supported protected trades.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/marketplace/browse" className="rounded-2xl bg-violet-600 px-7 py-4 text-center text-lg font-black shadow-[0_14px_40px_rgba(124,58,237,.42)]">Browse Cards</Link>
            <Link href="/sell" className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-center text-lg font-black hover:bg-white/10">Sell Your Cards</Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">Free to join · No inventory purchase required · You choose which offers to accept</p>
          <p className="mt-5 text-sm text-zinc-400">New to PullTheory? <Link href="/signup" className="font-bold text-amber-300">Create a free account</Link> <span className="px-1">·</span> <Link href="/login" className="font-bold text-amber-300">Log in</Link></p>
        </div>
      </section>
      <section className="mx-auto mt-5 grid max-w-5xl gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/[.035] p-5 text-center"><p className="text-2xl">🛍️</p><h2 className="mt-2 font-black">Buy with confidence</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Browse collector listings, compare details, and make offers on cards you want.</p></article>
        <article className="rounded-2xl border border-white/10 bg-white/[.035] p-5 text-center"><p className="text-2xl">📸</p><h2 className="mt-2 font-black">Sell your cards</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Post real photos, describe condition clearly, set your price, and review offers.</p></article>
        <article className="rounded-2xl border border-white/10 bg-white/[.035] p-5 text-center"><p className="text-2xl">🛡️</p><h2 className="mt-2 font-black">PullShield tools</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Explore the supported inspection and protected-trade process before you transact.</p></article>
      </section>
      <section className="mx-auto mt-5 max-w-5xl rounded-[2rem] border border-white/10 bg-white/[.035] p-7 sm:p-9">
        <p className="text-center text-xs font-black uppercase tracking-[.22em] text-violet-300">Make your next move</p>
        <h2 className="mt-3 text-center text-3xl font-black sm:text-4xl">One marketplace. Every kind of collector.</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[['Find a card','Search current community listings and make an offer.','/marketplace/browse'],['List a card','Add clear photos, details, and your asking price.','/marketplace/new'],['Choose your membership','Compare seller fees and collector features.','/pricing']].map(([h,p,url])=><article key={h} className="rounded-2xl border border-white/10 bg-black/25 p-5 text-center"><h3 className="font-black">{h}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">{p}</p><Link href={url} className="mt-4 inline-block text-sm font-bold text-amber-300">Explore →</Link></article>)}
        </div>
        <p className="mt-6 text-center"><Link href="/trust" className="text-sm font-bold text-violet-200">Learn about PullShield protection →</Link></p>
      </section>
      <footer className="px-3 py-7 text-center text-xs text-zinc-600"><div className="flex flex-wrap justify-center gap-4"><Link href="/sell">Sell cards</Link><Link href="/pricing">Memberships</Link><Link href="/trust">Trust Center</Link><Link href="/terms">Terms</Link><Link href="/marketplace/browse">Marketplace</Link></div><p className="mt-3">PullTheory · Built for Pokémon collectors.</p></footer>
    </div>
  </main>;
}
