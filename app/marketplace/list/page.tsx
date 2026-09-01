"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getCurrentAccessToken, getSupabaseClient } from "../../lib/supabase";
import { uploadTradePhotos } from "../../lib/tradePhotos";
import ReturnAddressFields, { formatReturnAddress, type ReturnAddress } from "../../components/ReturnAddressFields";
import CameraCapture from "../../components/CameraCapture";

type Listing = {
  id: number;
  name: string;
  offeredCard: string;
  desiredCard: string;
  status: string;
  notes?: string;
  photoUrls?: string[];
};

const stages = ["Offer accepted", "Ship to authentication", "Verified", "Forwarded to each collector"];

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", offeredCard: "", desiredCard: "", notes: "" });
  const [username, setUsername] = useState("");
  const [returnAddress, setReturnAddress] = useState<ReturnAddress>({ street: "", unit: "", city: "", state: "", zip: "" });
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  async function loadListings() {
    setLoading(true);
    try {
      const response = await fetch("/api/trades?is_listing=true&pageSize=48");
      const data = await response.json();
      setListings(response.ok ? data.items ?? [] : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
    const supabase = getSupabaseClient();
    void supabase?.auth.getSession().then(({ data }: any) => {
      const savedUsername = typeof data.session?.user.user_metadata?.username === "string" ? data.session.user.user_metadata.username : "";
      setUsername(savedUsername);
      if (savedUsername) setForm((current) => ({ ...current, name: savedUsername }));
    });
    const savedDraft = window.sessionStorage.getItem("pull-theory-listing-draft");
    if (!savedDraft) return;

    try {
      const draft = JSON.parse(savedDraft);
      setForm((current) => ({
        ...current,
        offeredCard: typeof draft.offeredCard === "string" ? draft.offeredCard : current.offeredCard,
        notes: typeof draft.notes === "string" ? draft.notes : current.notes,
      }));
      if (Array.isArray(draft.photos)) {
        const savedPhotos = draft.photos.filter((photo: unknown): photo is string => typeof photo === "string").slice(0, 6);
        setPhotoPreviews(savedPhotos);
        void Promise.all(savedPhotos.map(async (photo: string, index: number) => {
          const response = await fetch(photo);
          const blob = await response.blob();
          return new File([blob], `portfolio-card-${index + 1}.${blob.type === "image/png" ? "png" : "jpg"}`, { type: blob.type || "image/jpeg" });
        })).then(setPhotos).catch(() => setMessage("Please choose your card photos again before listing."));
      }
      window.sessionStorage.removeItem("pull-theory-listing-draft");
    } catch {
      window.sessionStorage.removeItem("pull-theory-listing-draft");
    }
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addPhotos(files: File[]) {
    const remaining = Math.max(0, 6 - photos.length);
    const selected = files.filter((file) => file.type.startsWith("image/")).slice(0, remaining);
    setPhotos((current) => [...current, ...selected].slice(0, 6));
    setPhotoPreviews((current) => [...current, ...selected.map((file) => URL.createObjectURL(file))].slice(0, 6));
  }

  async function postListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPosting(true);
    setMessage("");
    try {
      if (photos.length < 4) {
        throw new Error("Please upload at least 4 clear photos of the card before listing it.");
      }
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in before posting a listing.");
      const photoUrls = await uploadTradePhotos(photos);

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, photoUrls, shippingAddress: formatReturnAddress(returnAddress), is_listing: true, agree: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to post this listing.");

      setForm({ name: username, offeredCard: "", desiredCard: "", notes: "" });
      setReturnAddress({ street: "", unit: "", city: "", state: "", zip: "" });
      setPhotos([]);
      setPhotoPreviews([]);
      setMessage("Your card is live in the trade marketplace.");
      await loadListings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to post this listing.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl space-y-12">
        <section className="rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_82%_12%,rgba(124,58,237,0.27),transparent_31%),rgba(255,255,255,0.035)] p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Pull Theory Exchange</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Trade premium cards with a protected path to verified delivery.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">List a card, receive trade offers, and send both cards to authentication after an offer is accepted.</p>
          <div className="mt-9 grid gap-3 sm:grid-cols-4">
            {stages.map((stage, index) => <div key={stage} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm"><span className="mr-2 text-amber-300">0{index + 1}</span>{stage}</div>)}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.4fr]">
          <section className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Create listing</p>
            <h2 className="mt-3 text-2xl font-semibold">Put a card up for trade.</h2>
            <form onSubmit={postListing} className="mt-7 space-y-4">
              <Field label="Public display name" value={form.name} onChange={(value) => update("name", value)} placeholder="Collector name" required />
              <Field label="Card you are listing" value={form.offeredCard} onChange={(value) => update("offeredCard", value)} placeholder="Example: 1999 Charizard 4/102" required />
              <div className="rounded-2xl border border-dashed border-violet-400/35 bg-violet-500/[0.06] p-4">
                <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-white">Card photos <span className="text-rose-300">required</span></p><p className="mt-1 text-xs leading-5 text-zinc-400">Upload at least 4 clear photos: front, back, corners, and any flaws. You can add up to 6.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${photoPreviews.length >= 4 ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-200"}`}>{photoPreviews.length}/4 minimum</span></div>
                <input id="listing-photos" type="file" accept="image/*" multiple onChange={(event) => { addPhotos(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} className="sr-only" />
                <div className="mt-4 flex flex-wrap gap-3"><label htmlFor="listing-photos" className="cursor-pointer rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/10">{photoPreviews.length ? "Choose more photos" : "Choose card photos"}</label><CameraCapture disabled={photos.length >= 6} onCapture={(file) => addPhotos([file])} /></div>
                {photoPreviews.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{photoPreviews.map((preview, index) => <img key={preview} src={preview} alt={`Card upload ${index + 1}`} className="aspect-square w-full rounded-xl border border-white/10 object-cover" />)}</div>}
              </div>
              <Field label="Cards you want" value={form.desiredCard} onChange={(value) => update("desiredCard", value)} placeholder="Example: PSA 10 Lugia, or open to offers" />
              <ReturnAddressFields value={returnAddress} onChange={setReturnAddress} />
              <label className="block text-sm text-zinc-300">Notes<textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className="mt-2 min-h-20 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-violet-400" placeholder="Condition, grading, or trade preferences" /></label>
              <p className="text-xs leading-5 text-zinc-500">By listing, you agree to send your card to the designated authenticator if you accept a trade. Addresses are never shown in the marketplace.</p>
              <button disabled={posting} className="w-full rounded-2xl bg-violet-600 px-4 py-3 font-semibold transition hover:bg-violet-500 disabled:opacity-60">{posting ? "Posting..." : "List this card"}</button>
              {message && <p className="rounded-xl bg-white/[0.06] p-3 text-sm text-zinc-200">{message}</p>}
            </form>
          </section>

          <section>
            <div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Browse listings</p><h2 className="mt-2 text-3xl font-semibold">Cards available for trade</h2></div><button onClick={loadListings} className="text-sm text-violet-300 hover:text-violet-200">Refresh</button></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {loading ? <p className="text-zinc-400">Loading listings...</p> : listings.length ? listings.map((listing) => (
                <article key={listing.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-violet-400/40">
                  <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Open for offers</span><span className="text-xs uppercase tracking-wider text-zinc-500">#{listing.id}</span></div>
                  {listing.photoUrls?.[0] && <img src={listing.photoUrls[0]} alt={`Front of ${listing.offeredCard}`} className="mt-5 aspect-[2.5/3.5] w-full rounded-2xl border border-white/10 bg-black/25 object-contain" />}<h3 className="mt-5 text-xl font-semibold">{listing.offeredCard}</h3><p className="mt-2 text-sm text-zinc-400">Listed by {listing.name}</p>
                  <div className="mt-5 rounded-2xl bg-black/30 p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Looking for</p><p className="mt-1 text-sm text-zinc-200">{listing.desiredCard || "Open to offers"}</p></div>
                  <Link href={`/marketplace/${listing.id}`} className="mt-5 block rounded-2xl border border-violet-400/40 px-4 py-3 text-center text-sm font-semibold text-violet-200 transition hover:bg-violet-500/15">View listing & make offer</Link>
                </article>
              )) : <p className="rounded-3xl border border-dashed border-white/15 p-8 text-zinc-400">No public listings yet. Be the first collector to list a card.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return <label className="block text-sm text-zinc-300">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-zinc-600 focus:border-violet-400" /></label>;
}
