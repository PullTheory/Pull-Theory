"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PullShieldSaleAuthentication from "../../components/PullShieldSaleAuthentication";
import { getCurrentAccessToken } from "../../lib/supabase";

type Sale = { id: number; orderStatus: string; paymentStatus: string; authenticationStatus: string; itemAmountCents: number; sellerPayoutCents: number; authenticationChecklist?: Record<string, boolean>; authenticationEvidenceUrls?: string[]; authenticationNotes?: string | null; authenticatedBy?: string | null; authenticatedAt?: string | null };

export default function PullShieldAuthenticationPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Sign in with the PullShield operator account.");
      const response = await fetch("/api/pullshield", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to open PullShield authentication.");
      setSales((data.sales ?? []).filter((sale: Sale) => ["authentication_in_progress", "authentication_passed"].includes(sale.orderStatus)));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load authentication queue."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function approve(sale: Sale, payload: { authenticationChecklist: Record<string, boolean>; authenticationEvidenceUrls: string[]; authenticationNotes: string }) {
    const token = await getCurrentAccessToken();
    if (!token) throw new Error("Sign in with the PullShield operator account.");
    const response = await fetch(`/api/sales/${sale.id}/status`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: "authentication_passed", ...payload }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Unable to approve authentication.");
    setMessage(`Sale #${sale.id} passed PullShield authentication. Seller payout was released.`);
    await load();
  }

  return <main className="min-h-screen bg-[#050506] px-5 py-10 text-white"><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Private PullShield operations</p><h1 className="mt-2 text-4xl font-semibold">Authentication workbench</h1><p className="mt-3 max-w-2xl text-zinc-400">Document every authenticity check and keep photo evidence before any marketplace seller payout is released.</p></div><Link href="/pullshield" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold">Back to Desk</Link></div>
    {message && <p className="mt-6 rounded-xl border border-violet-300/20 bg-violet-400/10 p-4 text-sm text-violet-100">{message}</p>}
    <div className="mt-8 space-y-6">{loading ? <p className="text-zinc-400">Loading authentication queue...</p> : sales.length ? sales.map((sale) => <article key={sale.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Sale #{sale.id}</p><p className="mt-2 text-2xl font-semibold">{(sale.itemAmountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p><p className="mt-1 text-sm text-zinc-400">Seller payout: {(sale.sellerPayoutCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize">{sale.authenticationStatus.replaceAll("_", " ")}</span></div><PullShieldSaleAuthentication saleId={sale.id} initialChecklist={sale.authenticationChecklist} initialEvidence={sale.authenticationEvidenceUrls} initialNotes={sale.authenticationNotes} disabled={sale.orderStatus === "authentication_passed"} onApprove={(payload) => approve(sale, payload)}/>{sale.authenticatedAt && <p className="mt-3 text-xs text-zinc-500">Approved {new Date(sale.authenticatedAt).toLocaleString()} {sale.authenticatedBy ? `by ${sale.authenticatedBy}` : ""}</p>}</article>) : <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-400">No marketplace sales are currently in authentication.</div>}</div>
  </div></main>;
}
