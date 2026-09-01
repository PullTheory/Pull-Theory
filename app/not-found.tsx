import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050506]/80 px-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-violet-950/30 backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">Pull Theory HQ</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">That page isn’t here.</h1>
        <p className="mt-4 text-zinc-300">The link may be old, or the card or trade may no longer be available.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/marketplace/browse" className="rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500">Browse marketplace</Link>
          <Link href="/" className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-zinc-100 transition hover:bg-white/10">Go home</Link>
        </div>
      </section>
    </main>
  );
}
