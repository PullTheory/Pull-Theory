"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";
import { uploadTradePhotos } from "../lib/tradePhotos";
import ReturnAddressFields, { formatReturnAddress, type ReturnAddress } from "./ReturnAddressFields";
import CameraCapture from "./CameraCapture";

export default function OfferModal({ listing, onClose, onSubmitted }: any) {
  const [name, setName] = useState("");
  const [offeredCard, setOfferedCard] = useState("");
  const [returnAddress, setReturnAddress] = useState<ReturnAddress>({ street: "", unit: "", city: "", state: "", zip: "" });
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    void supabase?.auth.getSession().then(({ data }: any) => {
      const username = data.session?.user.user_metadata?.username;
      if (typeof username === "string" && username.trim()) setName(username.trim());
    });
  }, []);

  async function submitOffer(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      if (photos.length < 4) {
        throw new Error("Please upload at least 4 photos of the card you are offering.");
      }
      const supabase = getSupabaseClient();
      const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in to make a trade offer.");

      const photoUrls = await uploadTradePhotos(photos);
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, offeredCard, desiredCard: listing.offeredCard, shippingAddress: formatReturnAddress(returnAddress), notes, photoUrls, listing_id: listing.id, agree: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to send your offer.");
      onSubmitted?.();
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send your offer.");
    } finally {
      setSubmitting(false);
    }
  }

  function addPhotos(files: File[]) {
    const selected = files.filter((file) => file.type.startsWith("image/")).slice(0, Math.max(0, 6 - photos.length));
    setPhotos((current) => [...current, ...selected].slice(0, 6));
    setPhotoPreviews((current) => [...current, ...selected.map((file) => URL.createObjectURL(file))].slice(0, 6));
  }

  return <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="mx-auto my-8 w-full max-w-lg rounded-3xl border border-white/10 bg-[#121013] p-7 text-white shadow-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Trade offer</p><h3 className="mt-2 text-2xl font-semibold">Offer for {listing.offeredCard}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Your return address stays private and is used only after a trade is accepted.</p><form onSubmit={submitOffer} className="mt-6 space-y-4"><Input label="Public display name" value={name} setValue={setName} placeholder="Collector name" /><Input label="Card you are offering" value={offeredCard} setValue={setOfferedCard} placeholder="Example: 2002 Aquapolis Lugia" /><div className="rounded-2xl border border-dashed border-violet-400/35 bg-violet-500/[0.06] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Offer-card photos <span className="text-rose-300">required</span></p><p className="mt-1 text-xs text-zinc-400">At least 4 images: front, back, corners, and flaws.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${photos.length >= 4 ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-200"}`}>{photos.length}/4</span></div><input id="offer-photos" type="file" accept="image/*" multiple onChange={(event) => { addPhotos(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} className="sr-only" /><div className="mt-4 flex flex-wrap gap-3"><label htmlFor="offer-photos" className="cursor-pointer rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-center text-sm font-semibold text-violet-200">Choose card photos</label><CameraCapture disabled={photos.length >= 6} onCapture={(file) => addPhotos([file])} /></div>{photoPreviews.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{photoPreviews.map((preview, index) => <img key={preview} src={preview} alt={`Offer card ${index + 1}`} className="aspect-square rounded-xl object-cover" />)}</div>}</div><ReturnAddressFields value={returnAddress} onChange={setReturnAddress} /><label className="block text-sm text-zinc-300">Offer note<textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-20 w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none focus:border-violet-400" /></label>{message && <p className="rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{message}</p>}<div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/15 px-4 py-3 text-sm">Cancel</button><button disabled={submitting} className="flex-1 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold disabled:opacity-60">{submitting ? "Sending..." : "Send offer"}</button></div></form></div></div>;
}

function Input({ label, value, setValue, placeholder }: { label: string; value: string; setValue: (value: string) => void; placeholder: string }) {
  return <label className="block text-sm text-zinc-300">{label}<input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} required className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none placeholder:text-zinc-600 focus:border-violet-400" /></label>;
}
