"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OfferModal from "../../components/OfferModal";
import { getSupabaseClient } from "../../lib/supabase";
import { decodeCardDetails } from "../../lib/cardDetails";
import BuyNowButton from "../../components/BuyNowButton";

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    setLoading(true);
    try { const response = await fetch(`/api/trades/${id}/accept`); const data = await response.json(); setListing(response.ok ? data : null); }
    catch { setListing(null); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); const supabase = getSupabaseClient(); void supabase?.auth.getSession().then(({ data }: any) => setUserId(data.session?.user.id ?? null)); }, [id]);

  function openOffer() {
    if (!userId) { router.push(`/signup?returnTo=${encodeURIComponent(`/marketplace/${id}`)}`); return; }
    if (String(userId) === String(listing.user_id)) return;
    setModalOpen(true);
  }

  if (loading) return <main className="min-h-screen p-8 text-zinc-300">Loading listing...</main>;
  if (!listing) return <main className="min-h-screen p-8 text-white"><p>Listing not found.</p><Link href="/marketplace/browse" className="mt-4 inline-block text-violet-300">Back to marketplace</Link></main>;
  const ownListing = Boolean(userId && String(userId) === String(listing.user_id));
  const details = decodeCardDetails(listing.notes);
  const canBuy = (listing.listingType === "sell" || listing.listingType === "trade_or_sell") && Boolean(listing.salePriceCents);
  const canTrade = listing.listingType !== "sell";
  const detailItems = [["Set", details.setName], ["Card number", details.cardNumber], ["Year", details.year], ["Card type", details.gradingStatus === "graded" ? "Graded slab" : details.gradingStatus === "raw" ? "Raw card" : undefined], ["Grade", details.grade ? `${details.gradingCompany || ""} ${details.grade}`.trim() : undefined], ["Condition", details.condition], ["Estimated trade value", details.estimatedValue]].filter((item) => item[1]);

  return <main className="min-h-screen bg-[#050506]/70 px-4 py-8 text-white sm:px-6 sm:py-12"><div className="mx-auto max-w-5xl"><Link href="/marketplace/browse" className="text-sm font-semibold text-violet-300">← Back to marketplace</Link><section className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-9"><div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{listing.listingType === "sell" ? "For sale" : listing.listingType === "trade_or_sell" ? "Trade or sell" : "Available for trade"} · Listing #{listing.id}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{listing.offeredCard}</h1>{canBuy && <p className="mt-3 text-2xl font-bold text-emerald-200">{(listing.salePriceCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>}<p className="mt-3 text-zinc-400">Listed by <span className="font-semibold text-zinc-200">{listing.name}</span></p></div>{ownListing ? <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 px-5 py-4 text-sm"><p className="font-semibold text-violet-100">This is your listing.</p><p className="mt-1 text-zinc-400">Manage or delete it from the marketplace.</p><Link href="/marketplace/browse" className="mt-3 inline-block font-semibold text-violet-200">Manage listing →</Link></div> : <div className="flex flex-col gap-3">{canTrade && <button onClick={openOffer} className="rounded-2xl bg-violet-600 px-6 py-4 font-bold shadow-[0_14px_40px_rgba(124,58,237,0.35)]">{userId ? "Offer trade" : "Sign up to offer"}</button>}{canBuy && <BuyNowButton listingId={listing.id} priceCents={listing.salePriceCents} className="w-full px-6 py-4" />}</div>}</div>
    {listing.photoUrls?.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{listing.photoUrls.slice(0, 6).map((url: string, index: number) => <img key={url} src={url} alt={`${listing.offeredCard} photo ${index + 1}`} className="aspect-[2.5/3.5] w-full rounded-2xl border border-white/10 bg-black/25 object-contain" />)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-8 text-zinc-400">No card photos are available.</div>}
    <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]"><div><h2 className="text-xl font-semibold">Card details</h2>{detailItems.length ? <dl className="mt-4 grid gap-3 sm:grid-cols-2">{detailItems.map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-black/25 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt><dd className="mt-1 font-semibold text-zinc-100">{value}</dd></div>)}</dl> : <p className="mt-3 text-zinc-400">This older listing does not include structured card details.</p>}{details.collectorNotes && <div className="mt-5 rounded-2xl border border-white/10 p-5"><p className="text-xs uppercase tracking-wider text-zinc-500">Collector notes</p><p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-300">{details.collectorNotes}</p></div>}</div><aside className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Collector wants</p><p className="mt-3 text-xl font-semibold">{listing.desiredCard || "Open to offers"}</p><div className="mt-6 border-t border-white/10 pt-5"><p className="text-sm font-semibold text-white">Protected by PullShield</p><p className="mt-2 text-sm leading-6 text-zinc-400">Both collectors ship to Pull Theory. We compare the cards with these listings before forwarding either card.</p></div></aside></div>
  </section></div>{modalOpen && <OfferModal listing={listing} onClose={() => setModalOpen(false)} onSubmitted={() => void load()} />}</main>;
}
