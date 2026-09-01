"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabase";

type CardResult = {
  id: string;
  name: string;
  set: string;
  card_number: string;
  language: string;
  rarity: string;
  quantity_owned: number;
  current_market_value: string;
  purchased_price: string;
  estimated_condition: string;
  estimated_grade: string;
  date_acquired: string;
  storage_location: string;
  personal_notes: string;
  price: string;
  image_url?: string;
};

const sampleCards: CardResult[] = [
  {
    id: "1",
    name: "Charizard #4",
    set: "Legendary Flames",
    card_number: "004",
    language: "English",
    rarity: "Ultra Rare",
    quantity_owned: 1,
    current_market_value: "$1,880",
    purchased_price: "",
    estimated_condition: "",
    estimated_grade: "",
    date_acquired: "",
    storage_location: "",
    personal_notes: "",
    price: "$1,880",
    image_url: "/card-sample-1.jpg",
  },
  {
    id: "2",
    name: "Blue-Eyes White Dragon",
    set: "Retro Masters",
    card_number: "032",
    language: "English",
    rarity: "Legendary",
    quantity_owned: 1,
    current_market_value: "$1,420",
    purchased_price: "",
    estimated_condition: "",
    estimated_grade: "",
    date_acquired: "",
    storage_location: "",
    personal_notes: "",
    price: "$1,420",
    image_url: "/card-sample-2.jpg",
  },
  {
    id: "3",
    name: "Mystic Magician",
    set: "Collector's Vault",
    card_number: "088",
    language: "English",
    rarity: "Rare",
    quantity_owned: 1,
    current_market_value: "$320",
    purchased_price: "",
    estimated_condition: "",
    estimated_grade: "",
    date_acquired: "",
    storage_location: "",
    personal_notes: "",
    price: "$320",
    image_url: "/card-sample-3.jpg",
  },
  {
    id: "4",
    name: "Dragonite GX",
    set: "Premium Rivals",
    card_number: "011",
    language: "English",
    rarity: "Holo",
    quantity_owned: 1,
    current_market_value: "$590",
    purchased_price: "",
    estimated_condition: "",
    estimated_grade: "",
    date_acquired: "",
    storage_location: "",
    personal_notes: "",
    price: "$590",
    image_url: "/card-sample-4.jpg",
  },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cards, setCards] = useState<CardResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [collectionError, setCollectionError] = useState("");
  const [collectionSuccess, setCollectionSuccess] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [wantedIds, setWantedIds] = useState<string[]>([]);
  const [wantMessage, setWantMessage] = useState("");

  useEffect(() => {
    const timeout = collectionSuccess ? setTimeout(() => setCollectionSuccess(""), 4000) : undefined;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [collectionSuccess]);

  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoggedIn(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setLoggedIn(Boolean(data.session));
    }

    checkSession();
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("collectionIds");
    if (stored) {
      try {
        setAddedIds(JSON.parse(stored));
      } catch {
        setAddedIds([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("collectionIds", JSON.stringify(addedIds));
  }, [addedIds]);

  useEffect(() => {
    const hasSearchTerm = query.trim().length >= 2 || cardNumber.trim().length > 0;
    if (!hasSearchTerm) {
      setCards([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void loadCards();
    }, 300);

    async function loadCards() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/pokemon/search?q=${encodeURIComponent(query)}&number=${encodeURIComponent(cardNumber)}`,
          {
          signal: controller.signal,
          }
        );
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Search failed");
        }

        const results = (json.cards ?? []).map((item: any) => {
          const price =
            item.tcgplayer?.prices?.normal?.market ||
            item.tcgplayer?.prices?.holofoil?.market ||
            item.tcgplayer?.prices?.reverseHolofoil?.market ||
            item.tcgplayer?.prices?.["1stEdition"]?.market ||
            "N/A";
          return {
            id: item.id,
            name: item.name,
            set: item.set?.name ?? item.set ?? "Unknown",
            card_number: item.number ?? item.id ?? "N/A",
            language: item.language ?? item.languages?.[0] ?? "English",
            rarity: item.rarity ?? "Unknown",
            quantity_owned: 1,
            current_market_value: price,
            purchased_price: "",
            estimated_condition: "",
            estimated_grade: "",
            date_acquired: "",
            storage_location: "",
            personal_notes: "",
            price,
            image_url: item.images?.large ?? item.images?.small,
          };
        });

        if (!controller.signal.aborted) {
          setCards(results);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError("Live card search is temporarily unavailable. Please try again.");
      }

      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, cardNumber, searchAttempt]);

  async function addToCollection(card: CardResult) {
    if (!loggedIn) {
      setCollectionError("Please log in to save cards to your collection.");
      return;
    }

    if (addedIds.includes(card.id) || savingIds.includes(card.id)) {
      return;
    }

    setSavingIds((prev) => [...prev, card.id]);
    setCollectionError("");
    setCollectionSuccess("");

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setCollectionError("Supabase client not available.");
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token || null;

      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch("/api/collection", {
        method: "POST",
        headers,
        body: JSON.stringify(card),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to add card to collection.");
      }

      setAddedIds((prev) => [...prev, card.id]);
      setCollectionSuccess(`${card.name} saved to your collection.`);
    } catch (err) {
      setCollectionError(err instanceof Error ? err.message : "Failed to add card to collection.");
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== card.id));
    }
  }

  async function addToWantList(card: CardResult) {
    if (!loggedIn) { setCollectionError("Please log in to add cards to your Want List."); return; }
    setWantMessage("");
    try {
      const supabase = getSupabaseClient(); const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/wants", { method: "POST", headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) }, body: JSON.stringify(card) });
      const json = await response.json(); if (!response.ok) throw new Error(json.error ?? "Unable to add this card to your Want List.");
      setWantedIds((current) => current.includes(card.id) ? current : [...current, card.id]); setWantMessage(json.alreadyAdded ? "This card is already in your Want List." : `${card.name} was added to your Want List.`);
    } catch (error) { setWantMessage(error instanceof Error ? error.message : "Unable to add this card to your Want List."); }
  }

  return (
    <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(124,58,237,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">My Collection</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">Pokémon Card Database</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Find the exact Pokémon card by name and card number, then add it straight to your collection.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:w-[30rem] sm:grid-cols-[1fr_9rem]">
              <div>
              <label htmlFor="search" className="mb-2 block text-sm text-zinc-300">
                Card name
              </label>
              <input
                id="search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Example: Mimikyu ex"
                className="w-full rounded-3xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400"
              />
              </div>
              <div>
                <label htmlFor="card-number" className="mb-2 block text-sm text-zinc-300">
                  Card #
                </label>
                <input
                  id="card-number"
                  type="text"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  placeholder="e.g. 075"
                  className="w-full rounded-3xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400"
                />
              </div>
            </div>
          </div>
          {query.trim().length === 1 && !cardNumber.trim() && (
            <p className="mt-5 text-sm text-zinc-400">Keep typing—matches will appear after one more letter.</p>
          )}
          {query.trim().length >= 2 && !loading && cards.length > 0 && (
            <div className="mt-6 rounded-3xl border border-violet-400/20 bg-black/25 p-4">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Matching cards</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cards.slice(0, 6).map((card) => (
                  <button
                    key={`match-${card.id}`}
                    type="button"
                    onClick={() => {
                      setQuery(card.name);
                      setCardNumber(card.card_number);
                    }}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-violet-300/60 hover:bg-violet-500/10"
                  >
                    {card.image_url ? <img src={card.image_url} alt="" className="h-11 w-8 shrink-0 rounded object-cover" /> : <span className="grid h-11 w-8 shrink-0 place-items-center rounded bg-violet-500/20 text-violet-200">★</span>}
                    <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{card.name}</span><span className="mt-1 block truncate text-xs text-zinc-400">{card.set} · #{card.card_number}</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <p>{error}</p>
              <button type="button" onClick={() => setSearchAttempt((attempt) => attempt + 1)} className="rounded-xl border border-rose-200/40 px-3 py-1.5 font-semibold text-rose-50 transition hover:bg-rose-200/10">Retry search</button>
            </div>
          )}
          {collectionError && (
            <p className="mt-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {collectionError}
            </p>
          )}
          {collectionSuccess && (
            <p className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {collectionSuccess}
            </p>
          )}
          {wantMessage && <p className="mt-6 rounded-3xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">{wantMessage}</p>}
          {!loggedIn && (
            <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
              <p className="mb-3">You must be logged in to save cards to your collection.</p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                Log in
              </button>
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-zinc-300 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
              Loading search results...
            </div>
          ) : cards.length ? (
            cards.map((card) => {
              const added = addedIds.includes(card.id);
              return (
                <article
                  key={card.id}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(124,58,237,0.08)] transition hover:-translate-y-1"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-amber-300">{card.rarity}</p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">{card.name}</h2>
                    </div>
                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-violet-200">
                      {card.set}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-zinc-400">Current market estimate: {card.price}</p>
                  {card.image_url && (
                    <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                      <img src={card.image_url} alt={card.name} className="h-72 w-full object-contain p-3" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => addToCollection(card)}
                    disabled={!loggedIn || added || savingIds.includes(card.id)}
                    className={`mt-6 w-full rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                      !loggedIn || added || savingIds.includes(card.id)
                        ? "cursor-not-allowed bg-emerald-500/40 text-emerald-100"
                        : "bg-amber-400 text-black hover:bg-amber-300"
                    }`}
                  >
                    {added ? "Added to collection" : savingIds.includes(card.id) ? "Saving..." : !loggedIn ? "Login required" : "Add to collection"}
                  </button>
                  <button type="button" onClick={() => void addToWantList(card)} disabled={!loggedIn || wantedIds.includes(card.id)} className="mt-3 w-full rounded-3xl border border-violet-300/40 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-60">{wantedIds.includes(card.id) ? "In your Want List" : "I WANT THIS"}</button>
                </article>
              );
            })
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-zinc-300 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
              {error ? "No live card results are available right now." : "No cards match that query. Try a different name, set, or rarity."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
