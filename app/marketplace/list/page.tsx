"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getCurrentAccessToken, getSupabaseClient } from "../../lib/supabase";
import { uploadTradePhotos } from "../../lib/tradePhotos";
import { cardFinishLabel, encodeCardDetails, formatCardTitle, type CardDetails, type CardFinish } from "../../lib/cardDetails";
import CameraCapture from "../../components/CameraCapture";

type CardSuggestion = {
  id: string;
  name: string;
  number?: string;
  rarity?: string;
  set?: { name?: string; releaseDate?: string };
  images?: { small?: string };
  tcgplayer?: { prices?: Record<string, { market?: number }> };
};

type ListingDraft = {
  cardName?: string;
  selectedCard?: boolean;
  details?: CardDetails;
  imageUrl?: string;
  rarity?: string;
};

const emptyDetails: CardDetails = { setName: "", cardNumber: "", year: "", estimatedValue: "" };

function marketPrice(card: CardSuggestion) {
  return Object.values(card.tcgplayer?.prices ?? {}).find((price) => typeof price.market === "number")?.market;
}

function marketValue(card: CardSuggestion) {
  const value = marketPrice(card);
  return typeof value === "number"
    ? value.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "";
}

export default function MarketplaceListingPage() {
  const [username, setUsername] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumberSearch, setCardNumberSearch] = useState("");
  const [details, setDetails] = useState<CardDetails>(emptyDetails);
  const [cardImage, setCardImage] = useState("");
  const [rarity, setRarity] = useState("");
  const [selectedCard, setSelectedCard] = useState(false);
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [listingType, setListingType] = useState<"trade" | "sell" | "trade_or_sell">("trade");
  const [salePrice, setSalePrice] = useState("");

  useEffect(() => {
    const savedDraft = window.sessionStorage.getItem("pull-theory-listing-draft");
    if (!savedDraft) return;
    try {
      const draft = JSON.parse(savedDraft) as ListingDraft;
      if (draft.cardName) {
        setCardName(draft.cardName);
        setDetails({ ...emptyDetails, ...draft.details });
        setCardImage(draft.imageUrl ?? "");
        setRarity(draft.rarity ?? "");
        setSelectedCard(Boolean(draft.selectedCard));
      }
    } catch {}
    window.sessionStorage.removeItem("pull-theory-listing-draft");
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    void supabase?.auth.getSession().then(({ data }: any) => {
      if (!data.session?.user) {
        window.location.assign("/login");
        return;
      }
      const saved = data.session.user.user_metadata?.username;
      setUsername(
        typeof saved === "string" && saved.trim()
          ? saved.trim()
          : data.session.user.email?.split("@")[0] || "Collector",
      );
    });
  }, []);

  useEffect(() => {
    if (selectedCard) return;
    const name = cardName.trim();
    const number = cardNumberSearch.trim();
    if (name.length < 2 && !number) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      setMessage("");
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (name) params.set("q", name);
        if (number) params.set("number", number);
        const response = await fetch(`/api/pokemon/search?${params.toString()}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to search for cards.");
        const cards = (data.cards ?? []) as CardSuggestion[];
        setSuggestions(cards.slice(0, 50));
        if (cards.length === 0) setMessage("No cards match that query. Try a different name, set, or card number.");
      } catch (error) {
        setSuggestions([]);
        setMessage(error instanceof Error ? error.message : "Unable to search for cards.");
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [cardName, cardNumberSearch, selectedCard]);

  function chooseCard(card: CardSuggestion) {
    const price = marketPrice(card);
    setCardName(card.name);
    setCardNumberSearch(card.number || "");
    setDetails({
      setName: card.set?.name || "",
      cardNumber: card.number || "",
      year: card.set?.releaseDate?.slice(0, 4) || "",
      estimatedValue: marketValue(card),
    });
    setSalePrice(typeof price === "number" ? price.toFixed(2) : "");
    setCardImage(card.images?.small || "");
    setRarity(card.rarity || "");
    setSelectedCard(true);
    setSuggestions([]);
    setMessage("");
  }

  function resetCardSearch() {
    setCardName("");
    setCardNumberSearch("");
    setSelectedCard(false);
    setCardImage("");
    setRarity("");
    setDetails(emptyDetails);
    setSalePrice("");
    setSuggestions([]);
    setMessage("");
  }

  function addPhotos(files: File[]) {
    const selected = files.filter((file) => file.type.startsWith("image/")).slice(0, Math.max(0, 6 - photos.length));
    setPhotos((current) => [...current, ...selected].slice(0, 6));
    setPhotoPreviews((current) => [...current, ...selected.map((file) => URL.createObjectURL(file))].slice(0, 6));
  }

  async function postListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPosting(true);
    setMessage("");
    try {
      if (!selectedCard) throw new Error("Select the exact card first.");
      if (!details.finish) throw new Error("Choose whether your card is Holo or Reverse Holo.");
      if (photos.length < 2) throw new Error("Please upload a front and back photo of your card.");
      const salePriceCents = listingType === "trade" ? null : Math.round(Number(salePrice) * 100);
      if (listingType !== "trade" && (salePriceCents === null || !Number.isInteger(salePriceCents) || salePriceCents < 100)) {
        throw new Error("Enter a sale price of at least $1.00.");
      }
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in before posting a listing.");
      const photoUrls = await uploadTradePhotos(photos, 2);
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: username,
          offeredCard: formatCardTitle(cardName, details),
          desiredCard: listingType === "sell" ? "For sale" : "Open to offers",
          notes: encodeCardDetails(details),
          photoUrls,
          is_listing: true,
          listingType,
          salePriceCents,
          agree: true,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to post this listing.");
      window.location.assign(`/marketplace/${result.trade.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to post this listing.");
      setPosting(false);
    }
  }

  const inputClass = "mt-3 w-full rounded-[2rem] border border-white/10 bg-black/45 px-5 py-5 text-lg text-white outline-none placeholder:text-zinc-600 focus:border-violet-400";

  return (
    <main className="min-h-screen bg-[#050506]/70 px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/marketplace/browse" className="text-sm font-semibold text-violet-300">← Back to marketplace</Link>

        <form onSubmit={postListing} className="mt-5 space-y-6">
          <section className="rounded-[2.25rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Listing as</p>
            <p className="mt-2 text-lg font-semibold">{username || "Loading your profile..."}</p>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-zinc-200">How do you want to list this card?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {([
                  ["trade", "Trade", "Accept card-for-card offers."],
                  ["sell", "Sell", "Accept secure Buy Now payment."],
                  ["trade_or_sell", "Trade or Sell", "Let collectors choose either option."],
                ] as const).map(([value, label, copy]) => (
                  <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition ${listingType === value ? "border-violet-300 bg-violet-500/10" : "border-white/10 bg-black/20"}`}>
                    <input type="radio" name="listing-type" value={value} checked={listingType === value} onChange={() => setListingType(value)} className="sr-only" />
                    <span className="block font-semibold text-white">{label}</span>
                    <span className="mt-1 block text-xs leading-5 text-zinc-400">{copy}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {listingType !== "trade" && (
              <label className="mt-6 block text-sm text-zinc-300">
                Sale price (USD)
                <input value={salePrice} onChange={(event) => setSalePrice(event.target.value)} inputMode="decimal" type="number" min="1" step="0.01" placeholder="Market price fills automatically" required className={inputClass} />
                <span className="mt-2 block text-xs leading-5 text-zinc-500">The current market estimate fills automatically when available. You can change it before posting.</span>
              </label>
            )}

            {selectedCard && (
              <fieldset className="mt-6">
                <legend className="text-sm font-semibold text-zinc-200">Card finish <span className="text-rose-300">required</span></legend>
                <p className="mt-1 text-xs leading-5 text-zinc-500">Choose the finish on the actual card you are listing.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["holo", "reverse_holo"] as CardFinish[]).map((finish) => (
                    <label key={finish} className={`cursor-pointer rounded-2xl border p-4 transition ${details.finish === finish ? "border-violet-300 bg-violet-500/10" : "border-white/10 bg-black/20"}`}>
                      <input type="radio" name="card-finish" value={finish} checked={details.finish === finish} onChange={() => setDetails((current) => ({ ...current, finish }))} className="sr-only" />
                      <span className="block font-semibold text-white">{cardFinishLabel(finish)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>

          <section className="rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_65%_18%,rgba(124,58,237,0.16),transparent_35%),rgba(255,255,255,0.04)] p-6 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-300">Pokémon card database</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Find the exact Pokémon card</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">Find the exact Pokémon card by name and card number, then add it to your sale or trade listing.</p>

            {!selectedCard ? (
              <>
                <div className="mt-8 space-y-7">
                  <label className="block text-lg text-zinc-300">
                    Card name
                    <input value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Example: Mimikyu ex" className={inputClass} />
                  </label>
                  <label className="block text-lg text-zinc-300">
                    Card #
                    <input value={cardNumberSearch} onChange={(event) => setCardNumberSearch(event.target.value)} placeholder="e.g. 075" className={inputClass} />
                  </label>
                </div>

                {searching && <p className="mt-7 text-center text-sm text-violet-200">Searching the card database...</p>}

                {message && !searching && suggestions.length === 0 && (
                  <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-10 text-center text-lg leading-8 text-zinc-300">{message}</div>
                )}

                {suggestions.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-base font-semibold text-white">Matching cards</p>
                      <p className="text-xs text-zinc-500">Showing {suggestions.length} results</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {suggestions.map((card) => (
                        <button key={card.id} type="button" onClick={() => chooseCard(card)} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left transition hover:border-violet-300/50 hover:bg-white/[0.06]">
                          {card.images?.small ? (
                            <img src={card.images.small} alt="" className="aspect-[0.72] w-full object-contain bg-black/20 p-2" />
                          ) : (
                            <div className="aspect-[0.72] w-full bg-black/30" />
                          )}
                          <div className="p-3">
                            <strong className="block truncate text-sm text-white">{card.name}</strong>
                            <span className="mt-1 block truncate text-xs text-zinc-400">{card.set?.name}</span>
                            <span className="mt-1 block text-xs text-zinc-500">#{card.number}</span>
                            {marketValue(card) && <span className="mt-2 block text-xs font-semibold text-emerald-300">{marketValue(card)}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8 rounded-3xl border border-violet-300/30 bg-violet-500/[0.08] p-5">
                <div className="flex gap-4">
                  {cardImage && <img src={cardImage} alt="" className="h-36 w-24 rounded-xl border border-white/10 object-contain" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Selected card</p>
                    <h3 className="mt-2 text-xl font-semibold">{cardName}</h3>
                    <p className="mt-2 text-sm text-zinc-300">{[details.setName, details.cardNumber && `#${details.cardNumber}`, details.year, rarity, cardFinishLabel(details.finish)].filter(Boolean).join(" · ")}</p>
                    {details.estimatedValue && <p className="mt-2 text-sm font-semibold text-emerald-200">Market estimate: {details.estimatedValue}</p>}
                    <button type="button" onClick={resetCardSearch} className="mt-4 text-sm font-semibold text-violet-200 hover:text-white">Choose a different card</button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[2.25rem] border border-dashed border-violet-400/35 bg-violet-500/[0.06] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold">Your card photos <span className="text-rose-300">required</span></p>
                <p className="mt-1 text-sm leading-6 text-zinc-400">Upload the front and back of the actual card you own. You can add up to 6 photos.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${photos.length >= 2 ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-200"}`}>{photos.length}/2</span>
            </div>

            <input id="listing-photos" type="file" accept="image/*" multiple onChange={(event) => { addPhotos(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} className="sr-only" />
            <div className="mt-4 flex gap-3">
              <label htmlFor="listing-photos" className="cursor-pointer rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-violet-200">Choose photos</label>
              <CameraCapture disabled={photos.length >= 6} onCapture={(file) => addPhotos([file])} />
            </div>

            {photoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {photoPreviews.map((preview, index) => (
                  <img key={preview} src={preview} alt={`Card upload ${index + 1}`} className="aspect-square rounded-xl border border-white/10 object-cover" />
                ))}
              </div>
            )}
          </section>

          <p className="px-2 text-xs leading-5 text-zinc-500">Trade offers remain card-for-card. For sales, the buyer pays Pull Theory first; you ship to PullShield for authentication before your payout is released. Your return address stays private.</p>

          <button disabled={posting || !username || !selectedCard || !details.finish || photos.length < 2} className="sticky bottom-4 w-full rounded-2xl bg-violet-600 px-4 py-4 font-bold shadow-[0_14px_40px_rgba(124,58,237,0.35)] transition hover:bg-violet-500 disabled:opacity-60">
            {posting ? "Posting..." : "List this card"}
          </button>
        </form>
      </div>
    </main>
  );
}
