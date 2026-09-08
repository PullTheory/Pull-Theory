"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getCurrentAccessToken, getSupabaseClient } from "../../lib/supabase";
import { uploadTradePhotos } from "../../lib/tradePhotos";
import { encodeCardDetails, formatCardTitle, type CardDetails } from "../../lib/cardDetails";
import CameraCapture from "../../components/CameraCapture";

type CardSuggestion = { id: string; name: string; number?: string; rarity?: string; set?: { name?: string; releaseDate?: string }; images?: { small?: string }; tcgplayer?: { prices?: Record<string, { market?: number }> } };
type ListingDraft = { cardName?: string; selectedCard?: boolean; details?: CardDetails; imageUrl?: string; rarity?: string };
const emptyDetails: CardDetails = { setName: "", cardNumber: "", year: "", estimatedValue: "" };

function marketPrice(card: CardSuggestion) {
  return Object.values(card.tcgplayer?.prices ?? {}).find((price) => typeof price.market === "number")?.market;
}

function marketValue(card: CardSuggestion) {
  const value = marketPrice(card);
  return typeof value === "number" ? value.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "";
}

export default function MarketplaceListingPage() {
  const [username, setUsername] = useState("");
  const [cardName, setCardName] = useState("");
  const [details, setDetails] = useState<CardDetails>(emptyDetails);
  const [cardImage, setCardImage] = useState("");
  const [rarity, setRarity] = useState("");
  const [selectedCard, setSelectedCard] = useState(false);
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [listingType, setListingType] = useState<"trade" | "sell" | "trade_or_sell">("trade");
  const [salePrice, setSalePrice] = useState("");
  const [cardNumberSearch, setCardNumberSearch] = useState("");
  const [searchingNumber, setSearchingNumber] = useState(false);

  useEffect(() => {
    const savedDraft = window.sessionStorage.getItem("pull-theory-listing-draft");
    if (!savedDraft) return;
    try {
      const draft = JSON.parse(savedDraft) as ListingDraft;
      if (draft.cardName) {
        setCardName(draft.cardName); setDetails({ ...emptyDetails, ...draft.details }); setCardImage(draft.imageUrl ?? ""); setRarity(draft.rarity ?? ""); setSelectedCard(Boolean(draft.selectedCard));
      }
    } catch {}
    window.sessionStorage.removeItem("pull-theory-listing-draft");
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    void supabase?.auth.getSession().then(({ data }: any) => {
      if (!data.session?.user) { window.location.assign("/login"); return; }
      const saved = data.session.user.user_metadata?.username;
      setUsername(typeof saved === "string" && saved.trim() ? saved.trim() : data.session.user.email?.split("@")[0] || "Collector");
    });
  }, []);

  useEffect(() => {
    if (selectedCard || cardName.trim().length < 3) { setSuggestions([]); return; }
    const timer = window.setTimeout(async () => {
      try { const response = await fetch(`/api/pokemon/search?q=${encodeURIComponent(cardName.trim())}&limit=20`); const data = await response.json(); setSuggestions(response.ok ? (data.cards ?? []).slice(0, 6) : []); } catch { setSuggestions([]); }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [cardName, selectedCard]);

  function chooseCard(card: CardSuggestion) {
    const price = marketPrice(card);
    setCardName(card.name);
    setDetails({ setName: card.set?.name || "", cardNumber: card.number || "", year: card.set?.releaseDate?.slice(0, 4) || "", estimatedValue: marketValue(card) });
    setSalePrice(typeof price === "number" ? price.toFixed(2) : "");
    setCardNumberSearch(card.number || "");
    setCardImage(card.images?.small || ""); setRarity(card.rarity || ""); setSelectedCard(true); setSuggestions([]); setMessage("");
  }

  async function findByCardNumber() {
    const number = cardNumberSearch.trim();
    if (!number) { setMessage("Enter the card number first."); return; }
    setSearchingNumber(true); setMessage(""); setSelectedCard(false); setCardName(""); setCardImage(""); setRarity(""); setDetails(emptyDetails); setSalePrice("");
    try {
      const response = await fetch(`/api/pokemon/search?number=${encodeURIComponent(number)}&limit=50`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to search by card number.");
      const cards = (data.cards ?? []) as CardSuggestion[];
      if (cards.length === 0) { setSuggestions([]); setMessage(`No cards found for #${number}. Try the full card number or search by name.`); return; }
      if (cards.length === 1) { chooseCard(cards[0]); return; }
      setSuggestions(cards.slice(0, 12));
      setMessage(`Found ${cards.length} cards with #${number}. Choose the exact card below.`);
    } catch (error) {
      setSuggestions([]); setMessage(error instanceof Error ? error.message : "Unable to search by card number.");
    } finally { setSearchingNumber(false); }
  }

  function startNewSearch(value: string) { setCardName(value); setSelectedCard(false); setCardImage(""); setRarity(""); setDetails(emptyDetails); setSalePrice(""); }
  function addPhotos(files: File[]) { const selected = files.filter((file) => file.type.startsWith("image/")).slice(0, Math.max(0, 6 - photos.length)); setPhotos((current) => [...current, ...selected].slice(0, 6)); setPhotoPreviews((current) => [...current, ...selected.map((file) => URL.createObjectURL(file))].slice(0, 6)); }

  async function postListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPosting(true); setMessage("");
    try {
      if (!selectedCard) throw new Error("Select the exact card from the search results first.");
      if (photos.length < 2) throw new Error("Please upload a front and back photo of your personal card.");
      const salePriceCents = listingType === "trade" ? null : Math.round(Number(salePrice) * 100);
      if (listingType !== "trade" && (typeof salePriceCents !== "number" || !Number.isInteger(salePriceCents) || salePriceCents < 100)) throw new Error("Enter a sale price of at least $1.00.");
      const token = await getCurrentAccessToken(); if (!token) throw new Error("Please sign in before posting a listing.");
      const photoUrls = await uploadTradePhotos(photos, 2);
      const response = await fetch("/api/trades", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: username, offeredCard: formatCardTitle(cardName, details), desiredCard: listingType === "sell" ? "For sale" : "Open to offers", notes: encodeCardDetails(details), photoUrls, is_listing: true, listingType, salePriceCents, agree: true }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Unable to post this listing.");
      window.location.assign(`/marketplace/${result.trade.id}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to post this listing."); setPosting(false); }
  }

  const inputClass = "mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-zinc-600 focus:border-violet-400";
  return <main className="min-h-screen bg-[#050506]/70 px-4 py-8 text-white sm:px-6 sm:py-12"><div className="mx-auto max-w-3xl">
    <Link href="/marketplace/browse" className="text-sm font-semibold text-violet-300">← Back to marketplace</Link>
    <section className="mt-5 rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_82%_12%,rgba(124,58,237,0.27),transparent_31%),rgba(255,255,255,0.035)] p-7 sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Create listing</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Pick the card. Add two photos. Done.</h1><p className="mt-4 text-zinc-300">Pull Theory fills in the official card information and current market price. You only need clear front and back photos of the actual card you own.</p></section>
    <form onSubmit={postListing} className="mt-6 space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.06] p-4"><p className="text-xs uppercase tracking-wider text-emerald-200">Listing as</p><p className="mt-1 font-semibold">{username || "Loading your profile..."}</p></div>
      <fieldset><legend className="text-sm font-semibold text-zinc-200">How do you want to list this card?</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{([['trade', 'Trade', 'Accept card-for-card offers.'], ['sell', 'Sell', 'Accept secure Buy Now payment.'], ['trade_or_sell', 'Trade or Sell', 'Let collectors choose either option.']] as const).map(([value, label, copy]) => <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition ${listingType === value ? 'border-violet-300 bg-violet-500/10' : 'border-white/10 bg-black/20'}`}><input type="radio" name="listing-type" value={value} checked={listingType === value} onChange={() => setListingType(value)} className="sr-only" /><span className="block font-semibold text-white">{label}</span><span className="mt-1 block text-xs leading-5 text-zinc-400">{copy}</span></label>)}</div></fieldset>
      {listingType !== "trade" && <label className="block text-sm text-zinc-300">Sale price (USD)<input value={salePrice} onChange={(event) => setSalePrice(event.target.value)} inputMode="decimal" type="number" min="1" step="0.01" placeholder="Market price fills automatically" required className={inputClass} /><span className="mt-2 block text-xs leading-5 text-zinc-500">Pull Theory starts this at the current market estimate when available. You can adjust the price before posting. Buyers pay Pull Theory securely and your payout is released after PullShield verifies the card.</span></label>}
      {!selectedCard && <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-4"><p className="text-sm font-semibold text-amber-100">Know the card number?</p><p className="mt-1 text-xs leading-5 text-zinc-400">Enter the number printed on the card, like 199, 242, or 019, and Pull Theory will find matching cards directly.</p><div className="mt-3 flex gap-2"><input value={cardNumberSearch} onChange={(event) => setCardNumberSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void findByCardNumber(); } }} placeholder="Card #" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-300"/><button type="button" onClick={() => void findByCardNumber()} disabled={searchingNumber} className="shrink-0 rounded-xl bg-amber-300 px-4 py-3 font-semibold text-black disabled:opacity-60">{searchingNumber ? "Finding..." : "Find card"}</button></div></div>}
      {!selectedCard ? <label className="relative block text-sm text-zinc-300">Or search for the exact card by name<input value={cardName} onChange={(event) => startNewSearch(event.target.value)} placeholder="Start typing, like Mimikyu or Charizard" className={inputClass} />{suggestions.length > 0 && <div className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-white/15 bg-[#151217] p-2 shadow-2xl">{suggestions.map((card) => <button key={card.id} type="button" onClick={() => chooseCard(card)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-white/[0.07]">{card.images?.small && <img src={card.images.small} alt="" className="h-14 w-10 rounded object-cover" />}<span className="min-w-0"><strong className="block truncate text-white">{card.name}</strong><span className="block text-xs text-zinc-400">{card.set?.name} · #{card.number}</span>{marketValue(card) && <span className="block text-xs text-emerald-300">Market: {marketValue(card)}</span>}</span></button>)}</div>}</label> : <div className="rounded-2xl border border-violet-300/30 bg-violet-500/[0.08] p-5"><div className="flex gap-4">{cardImage && <img src={cardImage} alt="" className="h-28 w-20 rounded-xl border border-white/10 object-cover" />}<div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Card information filled in</p><h2 className="mt-2 text-xl font-semibold">{cardName}</h2><p className="mt-2 text-sm text-zinc-300">{[details.setName, details.cardNumber && `#${details.cardNumber}`, details.year, rarity].filter(Boolean).join(" · ") || "Official card details"}</p>{details.estimatedValue && <p className="mt-1 text-sm font-semibold text-emerald-200">Market estimate: {details.estimatedValue}</p>}<button type="button" onClick={() => { startNewSearch(""); setCardNumberSearch(""); }} className="mt-3 text-sm font-semibold text-violet-200 hover:text-white">Choose a different card</button></div></div></div>}
      <div className="rounded-2xl border border-dashed border-violet-400/35 bg-violet-500/[0.06] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">Your card photos <span className="text-rose-300">required</span></p><p className="mt-1 text-xs leading-5 text-zinc-400">Upload the front and back of the actual card you own. You can add up to 6 photos if you want to show close-ups.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${photos.length >= 2 ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-200"}`}>{photos.length}/2</span></div><input id="listing-photos" type="file" accept="image/*" multiple onChange={(event) => { addPhotos(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} className="sr-only" /><div className="mt-4 flex gap-3"><label htmlFor="listing-photos" className="cursor-pointer rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-violet-200">Choose photos</label><CameraCapture disabled={photos.length >= 6} onCapture={(file) => addPhotos([file])} /></div>{photoPreviews.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{photoPreviews.map((preview, index) => <img key={preview} src={preview} alt={`Card upload ${index + 1}`} className="aspect-square rounded-xl border border-white/10 object-cover" />)}</div>}</div>
      <p className="text-xs leading-5 text-zinc-500">Trade offers remain card-for-card. For sales, the buyer pays Pull Theory first; you ship to PullShield for authentication before your payout is released. Your return address stays private.</p>
      <button disabled={posting || !username || !selectedCard || photos.length < 2} className="sticky bottom-4 w-full rounded-2xl bg-violet-600 px-4 py-4 font-bold shadow-[0_14px_40px_rgba(124,58,237,0.35)] transition hover:bg-violet-500 disabled:opacity-60">{posting ? "Posting..." : "List this card"}</button>{message && <p className="rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{message}</p>}
    </form>
  </div></main>;
}
