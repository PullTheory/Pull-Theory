"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setTimeout(() => router.replace("/marketplace/browse"), 2500);
    return () => window.clearTimeout(timer);
  }, [router]);
  return <main className="min-h-screen bg-[#050506] px-6 py-20 text-white"><div className="mx-auto max-w-xl rounded-[2rem] border border-emerald-300/25 bg-emerald-400/10 p-10 text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Payment received</p><h1 className="mt-4 text-4xl font-semibold">Welcome to your new membership.</h1><p className="mt-5 leading-7 text-zinc-300">Pull Theory is confirming your subscription and adding your PullShield authentication credits now.</p><Link href="/marketplace/browse" className="mt-8 inline-block rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400">Browse the marketplace</Link></div></main>;
}
