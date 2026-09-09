import Link from "next/link";

export default function PublicLandingV2() {
  return (
    <main className="min-h-screen bg-[#050506] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-violet-400/30 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.42),transparent_40%),radial-gradient(circle_at_88%_58%,rgba(251,191,36,0.2),transparent_34%),rgba(255,255,255,0.035)] px-7 py-10 shadow-[0_28px_100px_rgba(76,29,149,0.34)] sm:px-12 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-amber-300">PullShield protected marketplace</p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl">Buy, sell, or trade Pokémon cards without trusting a stranger.</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">Pull Theory sits in the middle. Cards are sent to us for verification before a protected sale or trade is completed.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/marketplace/browse" className="rounded-2xl border border-white/20 bg-white/[0.06] px-7 py-4 font-bold">Browse cards first</Link>
                <Link href="/signup" className="rounded-2xl bg-violet-600 px-7 py-4 font-bold shadow-[0_14px_40px_rgba(124,58,237,0.42)]">Join PullTheory free</Link>
              </div>
              <p className="mt-4 text-sm text-zinc-400">No credit card required</p>
            </div>

            <aside className="mx-auto w-full max-w-xs rounded-[2rem] border border-amber-200/55 bg-black/45 p-4">
              <img src="/pikachu-giveaway.jpeg" alt="PSA 10 Pikachu giveaway" className="aspect-[3/4] w-full rounded-[1.5rem] object-cover" />
              <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Free to enter</p>
              <p className="mt-2 text-center text-xl font-black">PSA 10 Pikachu Giveaway</p>
              <p className="mt-2 text-center text-sm text-zinc-200">Create a free account by September 20, 2026 for your chance to win.</p>
              <Link href="/signup" className="mt-4 block rounded-xl bg-amber-300 px-4 py-3 text-center text-sm font-black text-black">Enter free</Link>
            </aside>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-violet-400/25 bg-[radial-gradient(circle_at_0%_0%,rgba(124,58,237,0.18),transparent_42%),rgba(255,255,255,0.035)] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-violet-300/30 bg-violet-500/10 text-5xl font-black text-violet-200 shadow-[0_0_60px_rgba(124,58,237,0.25)]">N</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">Meet the founder</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Hi, I&apos;m Nik. I built PullTheory for collectors who want a safer way to deal with strangers online.</h2>
              <p className="mt-5 max-w-3xl leading-7 text-zinc-300">Buying, selling, or trading valuable cards online can require a lot of trust between people who have never met. PullTheory adds a neutral verification step in the middle so the card can be checked against its listing before the protected transaction is completed.</p>
              <p className="mt-4 max-w-3xl leading-7 text-zinc-300">We&apos;re building our founding collector community right now. You can browse the marketplace before creating an account, and joining is free.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">The PullShield process</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-5xl">A protected transaction has a neutral middle.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Buy, sell, or trade", "Collectors agree on the transaction."],
              ["02", "Ship to Pull Theory", "The card comes to the neutral middle."],
              ["03", "We verify", "The card is checked against its listing."],
              ["04", "Complete the transaction", "Verified cards move to their new collector."],
            ].map(([step, title, text]) => (
              <article key={step} className="rounded-3xl border border-white/10 bg-black/25 p-5 text-left">
                <p className="text-amber-300">{step}</p>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-emerald-300/25 bg-emerald-400/[0.06] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">If a card fails verification</p>
            <h2 className="mt-3 text-2xl font-bold">The transaction stops.</h2>
            <p className="mt-3 text-zinc-300">We document the issue and do not forward a counterfeit, altered, or materially different card.</p>
          </article>
          <article className="rounded-3xl border border-amber-300/25 bg-amber-300/[0.06] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-200">PullShield protection</p>
            <h2 className="mt-3 text-2xl font-bold">Buyers and traders stay protected.</h2>
            <p className="mt-3 text-zinc-300">Sales and trades are not completed until the required card verification step is finished.</p>
          </article>
        </section>

        <section className="mt-8 rounded-[2rem] border border-violet-400/25 bg-violet-500/[0.07] p-8 text-center sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">Founding collectors</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">See the cards first. Join when you&apos;re ready.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">Browse without an account. When you&apos;re ready to buy, sell, trade, make an offer, or list a card, create your free PullTheory account.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/marketplace/browse" className="rounded-2xl border border-white/20 px-6 py-3 font-bold">Browse marketplace</Link>
            <Link href="/signup" className="rounded-2xl bg-violet-600 px-6 py-3 font-bold">Create free account</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
