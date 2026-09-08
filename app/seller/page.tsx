"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";

type Seller = { stripeAccountId: string; payoutsEnabled: boolean; detailsSubmitted: boolean } | null;
type Listing = { id: number; offeredCard: string; listingType?: string; salePriceCents?: number | null; status?: string };
type Sale = { id: number; listingId: number; itemAmountCents: number; sellerPayoutCents: number; orderStatus: string; paymentStatus: string; authenticationStatus: string; sellerTrackingNumber?: string | null; buyerTrackingNumber?: string | null };

const money = (amount: number) => (amount / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const label = (value: string) => value.replaceAll("_", " ");

export default function SellerPage() {
  const [seller, setSeller] = useState<Seller>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const token = await getCurrentAccessToken();
      if (!token) { window.location.assign("/login"); return; }
      const response = await fetch("/api/seller/dashboard", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load seller tools.");
      setSeller(data.seller ?? null); setListings(data.listings ?? []); setSales(data.sales ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load seller tools."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function connect() {
    setConnecting(true); setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in first.");
      const response = await fetch("/api/seller/onboarding", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Unable to open secure payout setup.");
      window.location.assign(data.url);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to open secure payout setup."); setConnecting(false); }
  }

  async function addTracking(sale: Sale) {
    const trackingNumber = window.prompt("Enter the carrier tracking number for your shipment to Pull Theory.", sale.sellerTrackingNumber ?? "")?.trim();
    if (!trackingNumber) return;
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in first.");
      const response = await fetch(`/api/sales/${sale.id}/tracking`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ trackingNumber }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save tracking.");
      setMessage("Seller shipment tracking saved.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save tracking."); }
  }

  const activeListings = listings.filter((listing) => listing.status === "pending");
  const pendingAuthentication = sales.filter((sale) => ["waiting_for_seller_shipment", "received_by_pulltheory", "authentication_in_progress"].includes(sale.orderStatus));
  const completed = sales.filter((sale) => sale.orderStatus === "completed");
  const payoutTotal = useMemo(() => sales.filter((sale) => sale.paymentStatus === "payout_released").reduce((sum, sale) => sum + sale.sellerPayoutCents, 0), [sales]);

  return <main className="min-h-screen bg-[#050506]/70 px-4 py-8 text-white sm:px-6 sm:py-12"><div className="mx-auto max-w-6xl">
    <section className="rounded-[2rem] border border-emerald-300/25 bg-[radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_42%),rgba(255,255,255,0.035)] p-7 sm:p-10"><p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200">Seller center</p><div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Sell with PullShield.</h1><p className="mt-4 max-w-2xl text-zinc-300">Buyers pay securely, you ship to Pull Theory, and payouts are released after the card and condition are verified.</p></div><Link href="/marketplace/list" className="rounded-2xl bg-violet-600 px-5 py-3 font-bold">＋ List a card</Link></div></section>
    {message && <p className="mt-6 rounded-2xl border border-rose-300/25 bg-rose-400/10 p-4 text-sm text-rose-100">{message}</p>}
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Stripe Connect payouts</p><h2 className="mt-2 text-2xl font-semibold">{seller?.payoutsEnabled ? "Payouts are ready" : "Set up secure seller payouts"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">Stripe verifies your identity and bank details directly. Pull Theory never sees or stores your bank account information.</p></div><button onClick={() => void connect()} disabled={connecting} className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black disabled:opacity-60">{connecting ? "Opening setup..." : seller?.payoutsEnabled ? "Update payout details" : "Set up payouts"}</button></div></section>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Active listings", activeListings.length], ["Sold cards", sales.length], ["Pending authentication", pendingAuthentication.length], ["Released payouts", money(payoutTotal)]].map(([name, value]) => <div key={String(name)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{name}</p><p className="mt-3 text-3xl font-semibold text-emerald-200">{value}</p></div>)}</section>
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Active listings</p><h2 className="mt-2 text-2xl font-semibold">Cards you have listed</h2></div><Link href="/marketplace/browse" className="text-sm font-semibold text-violet-200">View marketplace →</Link></div>{loading ? <p className="mt-5 text-zinc-400">Loading seller tools...</p> : activeListings.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{activeListings.map((listing) => <article key={listing.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-semibold">{listing.offeredCard}</p><p className="mt-2 text-sm text-zinc-400">{listing.listingType === "sell" ? "For sale" : listing.listingType === "trade_or_sell" ? "Trade or sell" : "Trade only"}{listing.salePriceCents ? ` · ${money(listing.salePriceCents)}` : ""}</p><Link href={`/marketplace/${listing.id}/edit`} className="mt-4 inline-flex rounded-xl border border-violet-300/35 px-3 py-2 text-sm font-semibold text-violet-100">Manage listing</Link></article>)}</div> : <p className="mt-5 text-zinc-400">No active listings yet. Pick a card from your collection and list it for trade, sale, or both.</p>}</section>
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Sales and authentication</p><h2 className="mt-2 text-2xl font-semibold">Your sold cards</h2>{sales.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{sales.map((sale) => <article key={sale.id} className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex items-start justify-between gap-3"><p className="font-semibold">Sale #{sale.id}</p><span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold capitalize text-violet-100">{label(sale.orderStatus)}</span></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-zinc-500">Sale amount</dt><dd className="mt-1 font-semibold">{money(sale.itemAmountCents)}</dd></div><div><dt className="text-zinc-500">Your payout</dt><dd className="mt-1 font-semibold text-emerald-200">{money(sale.sellerPayoutCents)}</dd></div><div><dt className="text-zinc-500">Payment</dt><dd className="mt-1 capitalize">{label(sale.paymentStatus)}</dd></div><div><dt className="text-zinc-500">Authentication</dt><dd className="mt-1 capitalize">{label(sale.authenticationStatus)}</dd></div></dl>{sale.orderStatus === "waiting_for_seller_shipment" && <button onClick={() => void addTracking(sale)} className="mt-5 rounded-xl border border-violet-300/40 px-4 py-2 text-sm font-semibold text-violet-100">{sale.sellerTrackingNumber ? "Update shipment tracking" : "Add shipment tracking"}</button>}{sale.sellerTrackingNumber && <p className="mt-4 text-sm text-zinc-300">Your tracking to Pull Theory: {sale.sellerTrackingNumber}</p>}{sale.buyerTrackingNumber && <p className="mt-2 text-sm text-zinc-300">Buyer tracking: {sale.buyerTrackingNumber}</p>}</article>)}</div> : <p className="mt-5 text-zinc-400">Completed sales will appear here with their authentication and payout status.</p>}</section>
    {completed.length > 0 && <p className="mt-5 text-sm text-emerald-200">{completed.length} sale{completed.length === 1 ? "" : "s"} completed.</p>}
  </div></main>;
}
