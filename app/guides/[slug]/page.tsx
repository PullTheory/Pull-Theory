import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { guides } from "../../lib/communityGuides";

export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return {};
  return { title: `${guide.title} | PullTheoryTrade`, description: guide.description, alternates: { canonical: `/guides/${guide.slug}` }, openGraph: { title: guide.title, description: guide.description, type: "article" } };
}
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  return <main className="mx-auto max-w-3xl px-4 py-10 text-zinc-100">
    <Link href="/guides" className="text-sm font-semibold text-violet-300 hover:text-white">← All collector guides</Link>
    <header className="mt-6 border-b border-white/10 pb-7">
      <p className="text-xs font-bold uppercase tracking-wider text-violet-300">{guide.category} · {guide.readTime}</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{guide.title}</h1>
      <p className="mt-4 text-lg leading-8 text-zinc-300">{guide.description}</p>
      <p className="mt-5 text-sm leading-7 text-zinc-400">{guide.intro}</p>
    </header>
    <div className="divide-y divide-white/10">
      {guide.sections.map((section) => <section key={section.heading} className="py-7">
        <h2 className="text-2xl font-bold">{section.heading}</h2>
        {section.body.map((paragraph) => <p key={paragraph} className="mt-3 leading-7 text-zinc-300">{paragraph}</p>)}
        {section.bullets && <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-zinc-300">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
      </section>)}
    </div>
    <aside className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <h2 className="text-xl font-bold">Ready to find your next card?</h2>
      <p className="mt-2 text-zinc-300">Keep your hunt organized and find collectors who may have what you want.</p>
      <div className="mt-4 flex flex-wrap gap-3"><Link href="/marketplace/browse" className="rounded-full bg-violet-500 px-5 py-3 font-bold">Browse marketplace</Link><Link href="/wants" className="rounded-full border border-white/15 px-5 py-3 font-bold">Manage Want List</Link></div>
      <p className="mt-4 text-xs text-zinc-500">Related searches: {guide.relatedSearches.join(" · ")}</p>
    </aside>
  </main>;
}
