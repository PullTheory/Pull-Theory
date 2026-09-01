"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCurrentAccessToken } from "../lib/supabase";
import ReturnAddressFields, { formatReturnAddress, type ReturnAddress } from "../components/ReturnAddressFields";

type Offer = {
  id: number;
  listing_id?: number | null;
  name: string;
  offeredCard: string;
  desiredCard: string;
  notes?: string;
  status?: string;
  created_at?: string | null;
  photoUrls?: string[];
  pullshieldShippingAddress?: string | null;
  addressTradeId?: number | null;
  needsReturnAddress?: boolean;
};

type Listing = { id: number; offeredCard: string };
type OfferTab = "new" | "accepted" | "completed" | "cancelled" | "refused";

const tabs: Array<{ id: OfferTab; label: string }> = [
  { id: "new", label: "New" },
  { id: "accepted", label: "Accepted" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "refused", label: "Declined" },
];

const activeStatuses = new Set(["accepted", "awaiting_shipment", "received", "authenticated", "return_shipped", "shipped"]);

function tabFor(offer: Offer, incomingIds: Set<number>): OfferTab | null {
  const status = offer.status ?? "pending";
  if (status === "pending") return incomingIds.has(offer.id) ? "new" : null;
  if (status === "countered") return "new";
  if (activeStatuses.has(status)) return "accepted";
  if (status === "verified" || status === "completed") return "completed";
  if (status === "cancelled" || status === "fake") return "cancelled";
  if (status === "refused") return "refused";
  return null;
}

function statusText(status?: string) {
  return (status ?? "pending").replaceAll("_", " ");
}

function Tracker({ status, pullshieldShippingAddress, addressTradeId, needsReturnAddress, onAddressSaved }: Pick<Offer, "status" | "pullshieldShippingAddress" | "addressTradeId" | "needsReturnAddress"> & { onAddressSaved: () => void }) {
  const steps = ["awaiting_shipment", "received", "authenticated", "return_shipped", "completed"];
  const current = Math.max(0, steps.indexOf(status ?? "awaiting_shipment"));
  const nextAction: Record<string, { title: string; detail: string }> = {
    awaiting_shipment: { title: "Action needed: ship your card", detail: "Use tracked, insured shipping, add your trade number inside the package, and send your card to PullShield." },
    received: { title: "PullShield has your card", detail: "Your card is in the inspection queue. You do not need to take action right now." },
    authenticated: { title: "Authentication complete", detail: "Both cards are verified and being prepared for their return shipment." },
    return_shipped: { title: "Your card is on its way", detail: "Watch for the delivery from PullShield. The trade will be marked completed once both returns are sent." },
    completed: { title: "Trade complete", detail: "Both cards have been shipped to their new collectors. Thank you for trading with confidence." },
  };
  const action = nextAction[status ?? "awaiting_shipment"] ?? nextAction.awaiting_shipment;

  return <>
    {needsReturnAddress && addressTradeId && <AcceptedAddressForm tradeId={addressTradeId} onSaved={onAddressSaved} />}
    <div className="mt-6 rounded-2xl border border-violet-400/25 bg-violet-500/[0.08] p-4">
      <p className="text-sm font-semibold text-violet-100">{action.title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-300">{action.detail}</p>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => <div key={step} className={`rounded-2xl border p-4 ${index <= current ? "border-emerald-300/35 bg-emerald-400/10" : "border-white/10 bg-black/20"}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${index <= current ? "text-emerald-200" : "text-zinc-500"}`}>{index + 1}. {statusText(step)}</p>
      </div>)}
    </div>
    {status === "awaiting_shipment" && pullshieldShippingAddress && <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Send your card to PullShield</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white">{pullshieldShippingAddress}</p><p className="mt-2 text-xs text-zinc-400">Use tracked, insured shipping and include your trade number inside the package.</p></div>}
  </>;
}

function AcceptedAddressForm({ tradeId, onSaved }: { tradeId: number; onSaved: () => void }) {
  const [address, setAddress] = useState<ReturnAddress>({ street: "", unit: "", city: "", state: "", zip: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to save your address.");
      const response = await fetch("/api/trades", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ tradeId, shippingAddress: formatReturnAddress(address) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save your address.");
      onSaved();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save your address."); }
    finally { setSaving(false); }
  }
  return <form onSubmit={save} className="mt-6 rounded-3xl border border-amber-300/35 bg-amber-300/[0.08] p-5"><p className="text-sm font-bold text-amber-100">One final step: add your private return address</p><p className="mt-2 text-sm leading-6 text-zinc-300">Your offer has been accepted. PullShield needs this address only to send your new card after verification.</p><div className="mt-4"><ReturnAddressFields value={address} onChange={setAddress} /></div><button disabled={saving} className="mt-4 w-full rounded-2xl bg-violet-600 px-4 py-3 font-semibold disabled:opacity-60">{saving ? "Saving securely..." : "Save return address"}</button>{message && <p className="mt-3 text-sm text-rose-200">{message}</p>}</form>;
}

export default function OffersPage() {
  const [incomingOffers, setIncomingOffers] = useState<Offer[]>([]);
  const [otherOffers, setOtherOffers] = useState<Offer[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<OfferTab>("new");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadOffers() {
    setLoading(true);
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to view your offers.");
      const response = await fetch("/api/offers", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load your offers.");
      setIncomingOffers(data.offers ?? []);
      setOtherOffers(data.acceptedOffers ?? []);
      setListings(data.listings ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load your offers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadOffers(); }, []);

  async function act(offerId: number, action: "accept" | "refuse" | "counter") {
    setActingId(offerId);
    setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to update an offer.");
      const counterTerms = action === "counter" ? window.prompt("What card or terms would you accept instead? Your message will be sent to the collector.")?.trim() : "";
      if (action === "counter" && !counterTerms) return;
      const endpoint = action === "accept" ? `/api/trades/${offerId}/accept-offer` : action === "refuse" ? `/api/trades/${offerId}/refuse-offer` : "/api/trades";
      const response = await fetch(endpoint, { method: action === "counter" ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: action === "counter" ? JSON.stringify({ offerId, counterTerms }) : undefined });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Unable to ${action} this offer.`);
      setMessage(action === "accept" ? "Offer accepted. Both collectors can now follow the PullShield tracker." : action === "counter" ? "Counter offer sent to the collector." : "Offer declined. It has been moved to the Declined tab.");
      await loadOffers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update this offer.");
    } finally {
      setActingId(null);
    }
  }

  const incomingIds = useMemo(() => new Set(incomingOffers.map((offer) => offer.id)), [incomingOffers]);
  const listingById = useMemo(() => new Map(listings.map((listing) => [listing.id, listing])), [listings]);
  const offers = useMemo(() => Array.from(new Map([...incomingOffers, ...otherOffers].map((offer) => [offer.id, offer])).values()).sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")), [incomingOffers, otherOffers]);
  const tabCounts = useMemo(() => Object.fromEntries(tabs.map((tab) => [tab.id, offers.filter((offer) => tabFor(offer, incomingIds) === tab.id).length])) as Record<OfferTab, number>, [offers, incomingIds]);
  const visibleOffers = offers.filter((offer) => tabFor(offer, incomingIds) === activeTab);

  if (!loading && offers.length === 0) {
    return <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white"><div className="mx-auto max-w-5xl"><section className="rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.26),transparent_45%),rgba(255,255,255,0.035)] p-8 sm:p-12"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Trade Center</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Ready for your first trade?</h1><p className="mt-4 max-w-2xl text-zinc-300">Add cards you have and cards you&apos;re looking for. Pull Theory will help find collectors who might be a match.</p><Link href="/matches" className="mt-8 inline-flex rounded-2xl bg-violet-600 px-6 py-4 font-bold text-white shadow-[0_14px_40px_rgba(124,58,237,0.35)] transition hover:bg-violet-500">🔥 FIND A PULLMATCH</Link></section></div></main>;
  }

  return <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white"><div className="mx-auto max-w-5xl">
    <section className="rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.26),transparent_45%),rgba(255,255,255,0.035)] p-8 sm:p-12"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Trade Center</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Every trade, clearly organized.</h1><p className="mt-4 max-w-2xl text-zinc-300">Review offers, see the next action, and follow every PullShield trade from acceptance through delivery.</p></section>
    <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? "bg-violet-500 text-white" : "text-zinc-300 hover:bg-white/10"}`}>{tab.label} <span className="ml-1 text-xs opacity-70">{tabCounts[tab.id]}</span></button>)}<button onClick={() => void loadOffers()} className="ml-auto text-sm font-semibold text-violet-300 hover:text-violet-200">Refresh</button></div>
    {message && <p className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">{message}</p>}
    <section className="mt-6 space-y-5">{loading ? <p className="text-zinc-400">Loading your offers...</p> : visibleOffers.length ? visibleOffers.map((offer) => {
      const listing = offer.listing_id ? listingById.get(offer.listing_id) : undefined;
      const isNewIncoming = activeTab === "new" && incomingIds.has(offer.id) && (offer.status ?? "pending") === "pending";
      return <article key={offer.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">{isNewIncoming ? "Offer for" : (offer.status ?? "") === "countered" ? "Counter offer" : "Trade"}</p><h2 className="mt-2 text-xl font-semibold">{listing?.offeredCard ?? offer.desiredCard}</h2><p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Card offered</p><p className="mt-2 text-lg font-semibold">{offer.offeredCard}</p><p className="mt-2 text-sm text-zinc-400">From {offer.name}</p>{offer.photoUrls?.length ? <div className="mt-4 grid max-w-sm grid-cols-4 gap-2">{offer.photoUrls.slice(0, 4).map((url, index) => <img key={url} src={url} alt={`${offer.offeredCard} photo ${index + 1}`} className="aspect-square rounded-xl border border-white/10 object-cover" />)}</div> : null}{offer.notes && <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">{offer.notes}</p>}</div><div className="flex shrink-0 flex-col gap-3"><span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-zinc-200">{(offer.status ?? "pending") === "refused" ? "declined" : statusText(offer.status)}</span>{isNewIncoming && <><button disabled={actingId === offer.id} onClick={() => void act(offer.id, "accept")} className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:opacity-50">{actingId === offer.id ? "Saving..." : "Accept offer"}</button><button disabled={actingId === offer.id} onClick={() => void act(offer.id, "counter")} className="rounded-2xl border border-amber-300/45 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-50">{actingId === offer.id ? "Saving..." : "Counter offer"}</button><button disabled={actingId === offer.id} onClick={() => void act(offer.id, "refuse")} className="rounded-2xl border border-rose-300/40 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/10 disabled:opacity-50">{actingId === offer.id ? "Saving..." : "Decline offer"}</button></>}{listing && <Link href={`/marketplace/${listing.id}`} className="text-center text-sm font-semibold text-violet-300 hover:text-violet-200">View listing</Link>}</div></div>{activeTab === "accepted" && <Tracker status={offer.status} pullshieldShippingAddress={offer.pullshieldShippingAddress} addressTradeId={offer.addressTradeId} needsReturnAddress={offer.needsReturnAddress} onAddressSaved={() => void loadOffers()} />}</article>;
    }) : <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-400"><p className="text-lg font-semibold text-white">{activeTab === "new" ? "No trade offers yet." : `No ${activeTab} offers yet.`}</p><p className="mt-2">{activeTab === "new" ? "Find a card you want and make your first offer." : "When a trade reaches this stage, it will appear here."}</p>{activeTab === "new" && <Link href="/marketplace/browse" className="mt-6 inline-flex rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500">BROWSE CARDS TO TRADE</Link>}</div>}</section>
  </div></main>;
}
