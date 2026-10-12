import Link from "next/link";
import type { Metadata } from "next";
import { guides } from "../lib/communityGuides";

export const metadata: Metadata = {
  title: "Pokémon Card Collecting Guides | PullTheoryTrade",
  description: "Practical guides to Pokémon card condition, grading, safe trading, and building a collection you love.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return <main className="mx-auto max-w-6xl px-4 py-10 text-zinc-100">
    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">The Collector’s Notebook</p>
    <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Better collecting starts with better info.</h1>
    <p className="mt-4 max-w-2xl text-lg text-zinc-300">Straightforward guides for checking condition, grading cards, trading safely, and building a collection around what you love.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {guides.map((guide) => <article key={guide.slug} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-violet-300/40">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">{guide.category} · {guide.readTime}</p>
        <h2 className="mt-3 text-xl font-bold"><Link className="hover:text-violet-200" href={`/guides/${guide.slug}`}>{guide.title}</Link></h2>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{guide.description}</p>
        <Link className="mt-5 inline-flex font-semibold text-violet-200 hover:text-white" href={`/guides/${guide.slug}`}>Read guide <span aria-hidden="true" className="ml-2">→</span></Link>
      </article>)}
    </div>
    <section className="mt-10 rounded-2xl border border-violet-300/20 bg-violet-500/[0.08] p-6">
      <h2 className="text-xl font-bold">Put your next find to work</h2>
      <p className="mt-2 text-zinc-300">Use your Want List to keep track of cards you’re hunting, then browse the marketplace for your next addition.</p>
      <div className="mt-4 flex flex-wrap gap-3"><Link className="rounded-full bg-violet-500 px-5 py-3 font-bold text-white" href="/marketplace/browse">Browse cards</Link><Link className="rounded-full border border-white/15 px-5 py-3 font-bold" href="/wants">Open Want List</Link></div>
    </section>
  </main>;
}
