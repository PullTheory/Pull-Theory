import type { ReactNode } from "react";

const features = [
  ["Collection Tracking", "Catalog every card in one organized collection.", "cards"],
  ["Portfolio Value", "Real-time market value and collection analytics.", "chart"],
  ["Market Trends", "Follow prices before the market moves.", "trend"],
  ["AI Collector Assistant", "Ask questions and receive collector-focused insights.", "spark"],
  ["TheoryScore", "Analyze rarity, demand, condition, and long-term potential.", "score"],
  ["PullMatch", "Find trustworthy collectors to trade with.", "match"],
] as const;

const values = [
  "Built by collectors.",
  "Transparent pricing.",
  "Secure trading.",
  "AI-powered insights.",
  "Portfolio growth.",
  "Community first.",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] text-white selection:bg-violet-500 selection:text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.28),_transparent_62%)]" />
        <div className="absolute top-16 left-10 h-80 w-80 rounded-full bg-fuchsia-500/12 blur-[140px]" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-amber-400/[0.08] blur-[120px]" />
        <div className="absolute left-[10%] top-[24rem] h-80 w-80 rounded-full bg-violet-700/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.02),transparent_8%),radial-gradient(circle_at_75%_10%,rgba(248,113,214,0.05),transparent_18%)]" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="#" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white" aria-label="Pull Theory HQ home">
          <img src="/logo.png?v=3" alt="Pull Theory HQ logo" className="h-12 w-12 rounded-full border border-white/20 bg-black/40 object-cover ring-1 ring-white/10" />
          <span className="text-sm tracking-[0.28em]">PULL <span className="text-violet-400">THEORY</span></span>
        </a>
        <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.24em] text-zinc-300 md:flex" aria-label="Primary navigation">
          <a className="transition hover:text-white" href="#features">Features</a>
          <a className="transition hover:text-white" href="#pricing">Pricing</a>
          <a className="transition hover:text-white" href="#about">About</a>
          <a className="transition hover:text-white" href="#blog">Blog</a>
          <a className="transition hover:text-white" href="#contact">Contact</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#login" className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-violet-400/70 hover:bg-white/10">Login</a>
          <a href="#get-started" className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(124,58,237,0.35)] transition hover:brightness-110">Get Started</a>
        </div>
      </header>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center overflow-hidden px-6 pb-28 pt-16 text-center sm:pt-20 lg:px-8 lg:pb-44">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.24),transparent_62%)]" />
        <div className="absolute inset-x-0 top-16 -z-10 mx-auto h-[34rem] w-[92%] rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_65%)] shadow-[0_0_120px_rgba(124,58,237,0.16)] blur-[90px]" />
        <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute right-10 top-28 -z-10 h-80 w-80 rounded-full bg-cyan-400/12 blur-[140px]" />
        <div className="absolute inset-x-0 top-[10rem] -z-10 mx-auto h-28 w-80 rounded-full bg-violet-500/10 blur-[70px]" />
        <div className="absolute left-16 top-[22rem] -z-10 h-28 w-52 rounded-full bg-pink-500/10 blur-[80px]" />
        <div className="relative mb-12 flex items-center justify-center">
          <div className="absolute inset-0 -z-10 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -left-24 top-10 -z-10 h-28 w-44 rounded-full bg-white/14 blur-[16px]" />
          <div className="absolute right-12 top-16 -z-10 h-24 w-36 rounded-full bg-white/12 blur-[14px]" />
          <div className="absolute left-10 top-20 -z-10 h-16 w-32 rounded-full bg-white/16 blur-[12px]" />
          <div className="absolute inset-x-0 top-1/2 -z-10 mx-auto h-52 w-[22rem] -translate-y-1/2 rounded-full border border-violet-300/10 bg-violet-500/5 blur-2xl" />
          <img src="/logo.png?v=3" alt="Pull Theory HQ" className="relative h-52 w-52 rounded-[2rem] border border-white/10 bg-black/55 object-cover shadow-[0_0_90px_rgba(124,58,237,0.45)] sm:h-64 sm:w-64" />
        </div>
        <p className="rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Trade with confidence</p>
        <h1 className="mt-10 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">The Home for <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">Serious</span> Collectors.</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">Track every card, understand your collection&apos;s value, and trade with confidence.</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a href="#get-started" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-12 py-4 text-sm font-semibold text-white shadow-[0_20px_80px_rgba(124,58,237,0.35)] transition hover:brightness-110">Get Started <span aria-hidden="true" className="ml-2">→</span></a>
          <a href="#features" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-12 py-4 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/[0.12]">Explore Features</a>
        </div>
      </section>

      <section id="features" className="border-t border-white/[0.08] bg-[#08070f] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Collector intelligence</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">Your whole hobby, finally in one place.</h2></div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, description, icon], index) => <FeatureCard key={title} index={index + 1} title={title} description={description} icon={icon} />)}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#09090f] p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(124,58,237,0.08)] sm:p-14">
          <div className="max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">The difference</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">Why Pull Theory HQ?</h2><p className="mt-5 text-lg leading-8 text-zinc-400">A platform made for collectors who want more clarity, more confidence, and a better place to grow the hobby.</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => <div key={value} className="flex flex-col gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] px-6 py-6 text-white shadow-[0_20px_60px_rgba(124,58,237,0.08)]"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">✓</span><p className="text-sm leading-6 text-zinc-300">{value}</p></div>)}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-3xl border border-violet-400/20 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.24),transparent_58%),rgba(255,255,255,0.025)] px-8 py-16 text-center shadow-[0_40px_120px_rgba(124,58,237,0.08)] sm:px-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Made for the long game</p><h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">Build a collection you&apos;re proud to own.</h2><a href="#get-started" className="mt-9 inline-block rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-amber-200">Create your free account</a>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] bg-[#06060d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="text-zinc-400">© Pull Theory HQ</p>
          <div className="flex flex-wrap gap-6 text-zinc-400">
            <a className="transition hover:text-white" href="#privacy">Privacy</a>
            <a className="transition hover:text-white" href="#terms">Terms</a>
            <a className="transition hover:text-white" href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ index, title, description, icon }: { index: number; title: string; description: string; icon: string }) {
  return <article className="group rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.06] hover:shadow-[0_40px_90px_rgba(124,58,237,0.18)]">
    <div className="flex items-start justify-between gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300 shadow-[0_15px_45px_rgba(124,58,237,0.12)]">
        <Icon name={icon} />
      </div>
      <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-violet-300/90">0{index}</div>
    </div>
    <h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3>
    <p className="mt-3 leading-7 text-zinc-400">{description}</p>
    <div className="mt-6 h-0.5 w-16 rounded-full bg-violet-400/20" />
  </article>;
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = { cards: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>, chart: <><path d="M5 19V9m5 10V5m5 14v-7m5 7V8" /></>, trend: <><path d="m4 17 5-5 4 3 7-8" /><path d="M15 7h5v5" /></>, spark: <path d="m12 3 2.1 5.9L20 11l-5.9 2.1L12 19l-2.1-5.9L4 11l5.9-2.1L12 3Z" />, score: <><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>, match: <><path d="M8 7H6a3 3 0 0 0 0 6h2m8-6h2a3 3 0 0 1 0 6h-2M8 12h8" /></> };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{paths[name]}</svg>;
}
