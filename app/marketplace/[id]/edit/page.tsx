"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentAccessToken, getSupabaseClient } from "../../../lib/supabase";
import { cardFinishLabel, decodeCardDetails, type CardFinish } from "../../../lib/cardDetails";

type ListingType = "trade" | "sell" | "trade_or_sell";
type GradingStatus = "raw" | "graded";
type Listing = { id: number; offeredCard: string; notes?: string; listingType?: ListingType; salePriceCents?: number | null; status?: string; user_id?: string | null };

const choices: Array<[ListingType, string, string]> = [
  ["trade", "Trade", "Accept card-for-card offers."],
  ["sell", "Sell", "Accept secure Buy Now payment."],
  ["trade_or_sell", "Trade or Sell", "Let collectors choose either option."],
];

function parseMarketValue(value?: string) {
  if (!value) return null;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const invalidId = !Number.isInteger(id) || id <= 0;
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [listingType, setListingType] = useState<ListingType>("trade");
  const [salePrice, setSalePrice] = useState("");
  const [finish, setFinish] = useState<CardFinish | "">("");
  const [gradingStatus, setGradingStatus] = useState<GradingStatus>("raw");
  const [gradingCompany, setGradingCompany] = useState("");
  const [grade, setGrade] = useState("");
  const [marketValue, setMarketValue] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(!invalidId);
  const [saving, setSaving] = useState(false);
  const rawMaxPrice = marketValue === null ? null : marketValue + 10;

  useEffect(() => {
    async function loadListing() {
      try {
        const supabase = getSupabaseClient();
        const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
        if (!data.session?.user) {
          router.replace(`/login?returnTo=${encodeURIComponent(`/marketplace/${id}/edit`)}`);
          return;
        }
        const response = await fetch(`/api/trades/${id}/accept`);
        const result = await response.json();
        if (!response.ok || String(result.user_id) !== String(data.session.user.id)) throw new Error("This listing was not found or does not belong to your account.");
        if (result.status !== "pending") throw new Error("Only active listings can be changed.");
        const loaded = result as Listing;
        const details = decodeCardDetails(loaded.notes);
        const loadedType = loaded.listingType === "sell" || loaded.listingType === "trade_or_sell" ? loaded.listingType : "trade";
        setListing(loaded);
        setListingType(loadedType);
        setSalePrice(loaded.salePriceCents ? (loaded.salePriceCents / 100).toFixed(2) : "");
        setFinish(details.finish ?? "");
        setGradingStatus(details.gradingStatus === "graded" ? "graded" : "raw");
        setGradingCompany(details.gradingCompany ?? "");
        setGrade(details.grade ?? "");
        setMarketValue(parseMarketValue(details.estimatedValue));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load this listing.");
      } finally {
        setLoading(false);
      }
    }
    if (!invalidId) void loadListing();
  }, [id, invalidId, router]);

  async function saveListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      if (!finish) throw new Error("Choose whether your card is Holo or Reverse Holo.");
      const price = Number(salePrice);
      const salePriceCents = listingType === "trade" ? null : Math.round(price * 100);
      if (listingType !== "trade" && (salePriceCents === null || !Number.isInteger(salePriceCents) || salePriceCents < 100)) throw new Error("Enter a sale price of at least $1.00.");
      if (gradingStatus === "graded" && (!gradingCompany.trim() || !grade.trim())) throw new Error("Choose the grading company and enter the grade.");
      if (listingType !== "trade" && gradingStatus === "raw") {
        if (rawMaxPrice === null) throw new Error("Pull Theory does not have a market value saved for this card. Re-select the card before listing it for sale.");
        if (price > rawMaxPrice) throw new Error(`Raw cards cannot be priced more than $10.00 over market value. Maximum price: $${rawMaxPrice.toFixed(2)}.`);
      }
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in before changing this listing.");
      const response = await fetch(`/api/trades/${id}/manage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingType, salePriceCents, gradingStatus, gradingCompany, grade }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to update this listing.");
      router.push(`/marketplace/${id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update this listing.");
      setSaving(false);
    }
  }

  if (invalidId) return <main className="min-h-screen p-8 text-white"><p>This listing is invalid.</p><Link href="/marketplace/browse" className="mt-4 inline-block text-violet-300">Back to marketplace</Link></main>;
  if (loading) return <main className="min-h-screen p-8 text-zinc-300">Loading listing...</main>;

  return <main className="min-h-screen bg-[#050506]/70 px-4 py-8 text-white sm:px-6 sm:py-12"><div className="mx-auto max-w-3xl"><Link href={`/marketplace/${id}`} className="text-sm font-semibold text-violet-300">← Back to listing</Link><section className="mt-5 rounded-[2rem] border border-violet-400/20 bg-white/[0.04] p-7 sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Manage listing</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{listing?.offeredCard ?? "Listing unavailable"}</h1><p className="mt-4 text-zinc-300">Change whether collectors can trade for this card, buy it, or choose either option.</p></section>{listing && <form onSubmit={saveListing} className="mt-6 space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8"><fieldset><legend className="text-sm font-semibold text-zinc-200">How do you want to list this card?</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{choices.map(([value, label, copy]) => <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition ${listingType === value ? "border-violet-300 bg-violet-500/10" : "border-white/10 bg-black/20"}`}><input type="radio" name="listing-type" value={value} checked={listingType === value} onChange={() => setListingType(value)} className="sr-only"/><span className="block font-semibold">{label}</span><span className="mt-1 block text-xs leading-5 text-zinc-400">{copy}</span></label>)}</div></fieldset><fieldset><legend className="text-sm font-semibold text-zinc-200">Card finish</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{(["holo", "reverse_holo"] as CardFinish[]).map((value) => <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition ${finish === value ? "border-violet-300 bg-violet-500/10" : "border-white/10 bg-black/20"}`}><input type="radio" name="card-finish" value={value} checked={finish === value} onChange={() => setFinish(value)} className="sr-only"/><span className="block font-semibold">{cardFinishLabel(value)}</span></label>)}</div></fieldset><fieldset><legend className="text-sm font-semibold text-zinc-200">Card type</legend><div className="mt-3 grid grid-cols-2 gap-3"><label className={`cursor-pointer rounded-2xl border p-4 ${gradingStatus === "raw" ? "border-violet-300 bg-violet-500/10" : "border-white/10 bg-black/20"}`}><input type="radio" name="grading-status" checked={gradingStatus === "raw"} onChange={() => setGradingStatus("raw")} className="sr-only"/><span className="block font-semibold">Raw</span><span className="mt-1 block text-xs text-zinc-400">Ungraded card</span></label><label className={`cursor-pointer rounded-2xl border p-4 ${gradingStatus === "graded" ? "border-violet-300 bg-violet-500/10" : "border-white/10 bg-black/20"}`}><input type="radio" name="grading-status" checked={gradingStatus === "graded"} onChange={() => setGradingStatus("graded")} className="sr-only"/><span className="block font-semibold">Graded</span><span className="mt-1 block text-xs text-zinc-400">Professionally graded slab</span></label></div></fieldset>{gradingStatus === "graded" && <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-zinc-300">Grading company<select value={gradingCompany} onChange={(event) => setGradingCompany(event.target.value)} required className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet-400"><option value="">Choose company</option><option value="PSA">PSA</option><option value="CGC">CGC</option><option value="BGS">BGS / Beckett</option><option value="SGC">SGC</option><option value="TAG">TAG</option><option value="Other">Other</option></select></label><label className="block text-sm text-zinc-300">Grade<input value={grade} onChange={(event) => setGrade(event.target.value)} required placeholder="e.g. 10" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-violet-400"/></label></div>}{listingType !== "trade" && <label className="block text-sm text-zinc-300">Sale price (USD)<input value={salePrice} onChange={(event) => setSalePrice(event.target.value)} inputMode="decimal" type="number" min="1" max={gradingStatus === "raw" && rawMaxPrice !== null ? rawMaxPrice.toFixed(2) : undefined} step="0.01" required placeholder="150.00" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-violet-400"/>{gradingStatus === "raw" ? <span className="mt-2 block text-xs leading-5 text-zinc-400">{marketValue !== null ? `Market value: $${marketValue.toFixed(2)} · Maximum raw-card price: $${rawMaxPrice!.toFixed(2)} ($10 over market).` : "A verified market value is required to sell a raw card."}</span> : <span className="mt-2 block text-xs leading-5 text-emerald-300">Graded cards are exempt from the raw-card $10-over-market limit.</span>}</label>}<div className="grid gap-3 sm:grid-cols-2"><button disabled={saving || !finish} className="rounded-2xl bg-violet-600 px-5 py-4 font-bold disabled:opacity-60">{saving ? "Saving..." : "Save listing changes"}</button><Link href={`/marketplace/${id}`} className="rounded-2xl border border-white/15 px-5 py-4 text-center font-semibold">Cancel</Link></div></form>}{message && <p aria-live="polite" className="mt-6 rounded-2xl border border-rose-300/25 bg-rose-400/10 p-4 text-sm text-rose-100">{message}</p>}</div></main>;
}
