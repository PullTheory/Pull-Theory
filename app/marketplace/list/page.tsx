"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getCurrentAccessToken, getSupabaseClient } from "../../lib/supabase";
import { uploadTradePhotos } from "../../lib/tradePhotos";
import { encodeCardDetails, formatCardTitle, type CardDetails } from "../../lib/cardDetails";
import CameraCapture from "../../components/CameraCapture";

type CardSuggestion = { id: string; name: string; number?: string; set?: { name?: string; releaseDate?: string }; images?: { small?: string } };
const emptyDetails: CardDetails = { setName: "", cardNumber: "", year: "", gradingStatus: "raw", gradingCompany: "", grade: "", condition: "", estimatedValue: "", collectorNotes: "" };

export default function MarketplaceListingPage() {
  const [username, setUsername] = useState("");
  const [cardName, setCardName] = useState("");
  const [desiredCard, setDesiredCard] = useState("");
  const [details, setDetails] = useState<CardDetails>(emptyDetails);
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();
    void supabase?.auth.getSession().then(({ data }: any) => {
      if (!data.session?.user) { window.location.assign("/login"); return; }
      const saved = data.session.user.user_metadata?.username;
      setUsername(typeof saved === "string" && saved.trim() ? saved.trim() : data.session.user.email?.split("@")[0] || "Collector");
    });
  }, []);

  useEffect(() => {
    if (cardName.trim().length < 3) { setSuggestions([]); return; }
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/pokemon/search?q=${encodeURIComponent(cardName.trim())}`);
        const data = await response.json();
        setSuggestions(response.ok ? (data.cards ?? []).slice(0, 6) : []);
      } catch { setSuggestions([]); }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [cardName]);

  function chooseCard(card: CardSuggestion) {
    setCardName(card.name);
    setDetails((current) => ({ ...current, setName: card.set?.name || "", cardNumber: card.number || "", year: card.set?.releaseDate?.slice(0, 4) || "" }));
    setSuggestions([]);
  }

  function updateDetail(field: keyof CardDetails, value: string) { setDetails((current) => ({ ...current, [field]: value })); }
  function addPhotos(files: File[]) {
    const selected = files.filter((file) => file.type.startsWith("image/")).slice(0, Math.max(0, 6 - photos.length));
    setPhotos((current) => [...current, ...selected].slice(0, 6));
    setPhotoPreviews((current) => [...current, ...selected.map((file) => URL.createObjectURL(file))].slice(0, 6));
  }

  async function postListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPosting(true); setMessage("");
    try {
      if (photos.length < 4) throw new Error("Please upload at least 4 clear photos of the card.");
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in before posting a listing.");
      const photoUrls = await uploadTradePhotos(photos);
      const offeredCard = formatCardTitle(cardName, details);
      const response = await fetch("/api/trades", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: username, offeredCard, desiredCard, notes: encodeCardDetails(details), photoUrls, is_listing: true, agree: true }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to post this listing.");
      window.location.assign(`/marketplace/${result.trade.id}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to post this listing."); setPosting(false); }
  }

  const inputClass = "mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-zinc-600 focus:border-violet-400";
  return <main className="min-h-screen bg-[#050506]/70 px-4 py-8 text-white sm:px-6 sm:py-12"><div className="mx-auto max-w-3xl">
    <Link href="/marketplace/browse" className="text-sm font-semibold text-violet-300">← Back to marketplace</Link>
    <section className="mt-5 rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_82%_12%,rgba(124,58,237,0.27),transparent_31%),rgba(255,255,255,0.035)] p-7 sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Create listing</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Put a card up for trade.</h1><p className="mt-4 text-zinc-300">Your return address is not needed now. We will securely collect it only after you accept a trade.</p></section>
    <form onSubmit={postListing} className="mt-6 space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.06] p-4"><p className="text-xs uppercase tracking-wider text-emerald-200">Listing as</p><p className="mt-1 font-semibold">{username || "Loading your profile..."}</p></div>
      <label className="relative block text-sm text-zinc-300">Card name<input value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Start typing, like Mimikyu or Charizard" required className={inputClass} />{suggestions.length > 0 && <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-white/15 bg-[#151217] p-2 shadow-2xl">{suggestions.map((card) => <button key={card.id} type="button" onClick={() => chooseCard(card)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-white/[0.07]">{card.images?.small && <img src={card.images.small} alt="" className="h-14 w-10 rounded object-cover" />}<span><strong className="block text-white">{card.name}</strong><span className="text-xs text-zinc-400">{card.set?.name} · #{card.number}</span></span></button>)}</div>}</label>
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Set" value={details.setName || ""} onChange={(v) => updateDetail("setName", v)} placeholder="Paldean Fates" /><Field label="Card number" value={details.cardNumber || ""} onChange={(v) => updateDetail("cardNumber", v)} placeholder="232/091" /><Field label="Year" value={details.year || ""} onChange={(v) => updateDetail("year", v.replace(/\D/g, "").slice(0, 4))} placeholder="2024" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-zinc-300">Card type<select value={details.gradingStatus} onChange={(event) => updateDetail("gradingStatus", event.target.value)} className={inputClass}><option value="raw">Raw card</option><option value="graded">Graded slab</option></select></label><label className="block text-sm text-zinc-300">Condition<select value={details.condition || ""} onChange={(event) => updateDetail("condition", event.target.value)} required className={inputClass}><option value="">Choose condition</option><option>Mint</option><option>Near Mint</option><option>Lightly Played</option><option>Moderately Played</option><option>Heavily Played</option><option>Damaged</option></select></label></div>
      {details.gradingStatus === "graded" && <div className="grid gap-4 sm:grid-cols-2"><Field label="Grading company" value={details.gradingCompany || ""} onChange={(v) => updateDetail("gradingCompany", v.toUpperCase())} placeholder="PSA, CGC, BGS" required /><Field label="Grade" value={details.grade || ""} onChange={(v) => updateDetail("grade", v)} placeholder="10" required /></div>}
      <Field label="Estimated trade value (optional)" value={details.estimatedValue || ""} onChange={(v) => updateDetail("estimatedValue", v)} placeholder="$75 or about $75" />
      <div className="rounded-2xl border border-dashed border-violet-400/35 bg-violet-500/[0.06] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">Card photos <span className="text-rose-300">required</span></p><p className="mt-1 text-xs leading-5 text-zinc-400">Add front, back, grading label or corners, and any flaw. Minimum 4, maximum 6.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${photos.length >= 4 ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-200"}`}>{photos.length}/4</span></div><input id="listing-photos" type="file" accept="image/*" multiple onChange={(event) => { addPhotos(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} className="sr-only" /><div className="mt-4 flex gap-3"><label htmlFor="listing-photos" className="cursor-pointer rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-violet-200">Choose photos</label><CameraCapture disabled={photos.length >= 6} onCapture={(file) => addPhotos([file])} /></div>{photoPreviews.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{photoPreviews.map((preview, index) => <img key={preview} src={preview} alt={`Card upload ${index + 1}`} className="aspect-square rounded-xl border border-white/10 object-cover" />)}</div>}</div>
      <Field label="Cards you want" value={desiredCard} onChange={setDesiredCard} placeholder="PSA 10 Lugia, Mimikyu cards, or open to offers" />
      <label className="block text-sm text-zinc-300">Notes<textarea value={details.collectorNotes || ""} onChange={(event) => updateDetail("collectorNotes", event.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-violet-400" placeholder="Visible flaws, cert number, or trade preferences" /></label>
      <p className="text-xs leading-5 text-zinc-500">By listing, you agree to send the card to PullShield if you accept an offer. Your shipping information will remain private.</p>
      <button disabled={posting || !username} className="sticky bottom-4 w-full rounded-2xl bg-violet-600 px-4 py-4 font-bold shadow-[0_14px_40px_rgba(124,58,237,0.35)] transition hover:bg-violet-500 disabled:opacity-60">{posting ? "Posting..." : "List this card"}</button>{message && <p className="rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{message}</p>}
    </form>
  </div></main>;
}

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) { return <label className="block text-sm text-zinc-300">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-zinc-600 focus:border-violet-400" /></label>; }
