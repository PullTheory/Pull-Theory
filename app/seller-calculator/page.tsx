"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const plans = [
  { name: "Collector", fee: 8, cost: "$0 / month" },
  { name: "Trader", fee: 6.5, cost: "$9.99 / month" },
  { name: "Pro", fee: 5, cost: "$19.99 / month" },
  { name: "Elite", fee: 3.5, cost: "$34.99 / month" },
];

export default function SellerCalculatorPage() {
  const [price, setPrice] = useState("50");
  const [plan, setPlan] = useState("Collector");
  const [shipping, setShipping] = useState("0");
  const selected = plans.find((item) => item.name === plan) ?? plans[0];
  const estimate = useMemo(() => {
    const sale = Math.max(0, Number(price) || 0);
    const postage = Math.max(0, Number(shipping) || 0);
    const fee = sale * selected.fee / 100;
    return { sale, fee, postage, net: sale - fee - postage };
  }, [price, shipping, selected.fee]);

  return <main className="min-h-screen px-4 py-10 text-white sm:px-6 sm:py-16">
    <div className="mx-auto max-w-4xl">
      <Link href="/sell" className="text-sm font-bold text-violet-300 hover:text-white">← Back to selling guide</Link>
      <div className="mt-8 rounded-[2rem] border border-violet-300/20 bg-[radial-gradient(circle_at_10%_0%,rgba(124,58,237,.25),transparent_45%),rgba(255,255,255,.035)] p-6 sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">Free seller tool</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">What could you take home?</h1>
        <p className="mt-4 max-w-2xl leading-7 text-zinc-300">Estimate your proceeds after the currently published PullTheory marketplace seller fee and the shipping cost you enter.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-bold text-zinc-300">Expected sale price ($)</span><input inputMode="decimal" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-lg outline-none focus:border-violet-400" /></label>
          <label className="block"><span className="mb-2 block text-sm font-bold text-zinc-300">Your membership</span><select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full rounded-xl border border-white/15 bg-[#111116] px-4 py-3 text-lg outline-none focus:border-violet-400">{plans.map((item) => <option key={item.name} value={item.name}>{item.name} — {item.fee}% fee</option>)}</select></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-bold text-zinc-300">Shipping you pay ($)</span><input inputMode="decimal" type="number" min="0" step="0.01" value={shipping} onChange={(e) => setShipping(e.target.value)} className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-lg outline-none focus:border-violet-400" /></label>
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/35 p-6">
          <p className="text-sm font-bold text-zinc-400">Estimated proceeds</p>
          <p className="mt-2 text-5xl font-black text-emerald-300">${estimate.net.toFixed(2)}</p>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><span className="text-zinc-400">Sale price</span><span>${estimate.sale.toFixed(2)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-400">Marketplace fee ({selected.fee}%)</span><span>−${estimate.fee.toFixed(2)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-zinc-400">Shipping entered</span><span>−${estimate.postage.toFixed(2)}</span></div>
          </div>
        </div>
        <p className="mt-5 text-xs leading-5 text-zinc-500">Estimate only. It excludes payment-processing charges, taxes, refunds, chargebacks, optional protection services, and any other checkout adjustments. Membership fees are separate and are not included in this per-sale estimate. Confirm the final fee and payout shown at checkout before completing a sale.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/marketplace/new" className="rounded-xl bg-violet-600 px-6 py-4 text-center font-black hover:bg-violet-500">List a Card</Link><Link href="/pricing" className="rounded-xl border border-white/15 px-6 py-4 text-center font-bold hover:bg-white/5">Compare Memberships</Link></div>
      </div>
    </div>
  </main>;
}
