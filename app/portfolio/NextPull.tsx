"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabase";

type Want = { id: number; card_name: string; card_set?: string | null; card_number?: string | null; image_url?: string | null };
type Listing = { id: number | string; offeredCard?: string; desiredCard?: string; listingType?: string; salePriceCents?: number | null; notes?: string; photoUrls?: string[] };

const normalize = (value: unknown) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const detailsFromNotes = (notes?: string) => {
  const prefix = "PT_CARD_DETAILS:";
  if (!notes?.startsWith(prefix)) return { setName: "", cardNumber: "" };
  try {
    const parsed = JSON.parse(notes.slice(prefix.length));
    return { setName: String(parsed?.setName ?? ""), cardNumber: String(parsed?.cardNumber ?? "") };
  } catch {
    return { setName: "", cardNumber: "" };
  }
};

export default function NextPull({ ownedCount }: { ownedCount: number }) {
  const router = useRouter();
  const [wants, setWants] = useState<Want[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseClient();
        const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
        const headers: HeadersInit = data.session?.access_token
          ? { Authorization: `Bearer ${data.session.access_token}` }
          : {};
        const [wantResponse, listingResponse] = await Promise.all([
          fetch("/api/wants", { headers }),
          fetch("/api/trades?is_listing=true&pageSize=100", { headers }),
        ]);
        const [wantData, listingData] = await Promise.all([wantResponse.json(), listingResponse.json()]);
        setWants(wantData.wants ?? []);
        setListings(listingData.items ?? []);
      } catch {
        // The collection page remains useful even if recommendations cannot load.
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const recommendations = useMemo(() => {
    const matches = wants.map((want) => {
      const name = normalize(want.card_name);
      const set = normalize(want.card_set);
      const number = normalize(want.card_number);
      const listing = listings.find((item) => {
        if (normalize(item.offeredCard) !== name) return false;
        const details = detailsFromNotes(item.notes);
        if (set && normalize(details.setName) && normalize(details.setName) !== set) return false;
        if (number && normalize(details.cardNumber) && normalize(details.cardNumber) !== number) return false;
        return true;
      });
      return { want, listing };
    }).filter((item) => item.listing);

    if (matches.length) return matches.slice(0, 3);
    return wants.slice(0, 3).map((want) => ({ want, listing: undefined }));
  }, [wants, listings]);

  async function addWant(card: { card_name: string; card_set?: string | null; card_number?: string | null; image_url?: string | null }) {
    setAdding(-1);
    setMessage("");
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/wants", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
        body: JSON.stringify(card),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to add this card.");
      setWants((current) => [{ ...(result.want ?? card), id: result.want?.id ?? Date.now() }, ...current]);
      setMessage("Added to your Want List. PullTheory will use it for matching.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add this card.");
    } finally {
      setAdding(null);
    }
  }

  const nextMilestone = ownedCount < 5 ? 5 : ownedCount < 10 ? 10 : ownedCount < 25 ? 25 : ownedCount + 10;
  const progress = Math.min(100, Math.round((ownedCount / nextMilestone) * 100));

  if (loading) return null;

  return (
    <section className="mt-8 rounded-[2rem] border border-amber-300/20 bg-[radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.16),transparent_45%),rgba(255,255,255,0.035)] p-7 sm:p-9">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">Your Next Pull</p>
          <h2 className="mt-2 text-3xl font-semibold">You started your collection. What are you hunting next?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">Pick a card to chase. Add it to your Want List and PullTheory will surface matching trade opportunities when they appear.</p>
        </div>
        <button type="button" onClick={() => router.push("/search")} className="shrink-0 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]">Browse cards →</button>
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="flex items-center justify-between gap-4 text-sm"><span className="font-semibold">Collector journey</span><span className="text-zinc-400">{ownedCount} / {nextMilestone} cards</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 text-xs text-zinc-400">Next milestone: collect {nextMilestone} cards. Keep building the loop.</p>
      </div>

      {message && <p className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">{message}</p>}

      {recommendations.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {recommendations.map(({ want, listing }, index) => (
            <article key={`${want.id}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
              {want.image_url ? <img src={want.image_url} alt="" className="h-44 w-full object-contain bg-black/30" /> : <div className="flex h-44 items-center justify-center bg-violet-500/10 text-5xl">🎴</div>}
              <div className="p-5">
                <p className="font-bold text-lg">{want.card_name}</p>
                {(want.card_set || want.card_number) && <p className="mt-1 text-xs text-zinc-400">{[want.card_set, want.card_number].filter(Boolean).join(" · ")}</p>}
                {listing ? (
                  <button type="button" onClick={() => router.push(`/marketplace/${listing.id}`)} className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-amber-300">🔥 See the match</button>
                ) : (
                  <button type="button" onClick={() => void addWant(want)} disabled={adding !== null} className="mt-5 w-full rounded-xl border border-amber-300/40 bg-amber-300/[0.08] px-4 py-3 text-sm font-bold text-amber-100 transition hover:bg-amber-300/[0.14] disabled:opacity-50">{wants.some((item) => item.id === want.id) ? "On your Want List" : "Want this card"}</button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-amber-300/25 bg-amber-300/[0.04] p-7 text-center">
          <p className="text-xl font-semibold">Choose your next 3 cards.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">The fastest way to make PullTheory useful is to tell us what you&apos;re hunting. We&apos;ll use your Want List to find real matches.</p>
          <button type="button" onClick={() => router.push("/search")} className="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-300">Pick my next card →</button>
        </div>
      )}
    </section>
  );
}
