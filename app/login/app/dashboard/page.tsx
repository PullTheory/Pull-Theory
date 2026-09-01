"use client";

import { DragEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabase";

function numericValue(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

type CollectionCard = {
  id: string;
  card_id: string;
  card_name: string;
  card_set: string;
  card_number?: string;
  language?: string;
  rarity?: string;
  quantity_owned?: number;
  current_market_value?: string;
  purchased_price?: string;
  estimated_condition?: string;
  estimated_grade?: string;
  date_acquired?: string;
  storage_location?: string;
  personal_notes?: string;
  price?: string;
  image_url?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [collectionCards, setCollectionCards] = useState<CollectionCard[]>([]);
  const [binders, setBinders] = useState<Array<{ id: string; name: string }>>([]);
  const [binderName, setBinderName] = useState("");
  const [editingBinderId, setEditingBinderId] = useState<string | null>(null);
  const [editingBinderName, setEditingBinderName] = useState("");
  const [binderError, setBinderError] = useState("");
  const [binderSuccess, setBinderSuccess] = useState("");
  const [binderAssignments, setBinderAssignments] = useState<Record<string, string[]>>({});
  const [dragOverBinder, setDragOverBinder] = useState<string | null>(null);
  const [newTrades, setNewTrades] = useState<Array<{ id: number; name: string; offeredCard: string; desiredCard: string }>>([]);
  const [photoCardId, setPhotoCardId] = useState<string | null>(null);
  const [conditionPhotos, setConditionPhotos] = useState<Record<string, string[]>>({});
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null);
  const [cardDraft, setCardDraft] = useState({ quantity_owned: "1", current_market_value: "", estimated_condition: "", is_graded: false, estimated_grade: "", personal_notes: "" });
  const [savingCard, setSavingCard] = useState(false);
  const portfolioValue = collectionCards.reduce((total, card) => total + numericValue(card.current_market_value ?? card.price) * (card.quantity_owned ?? 1), 0);

  // scan feature removed

  async function handleLogout() {
    setLoading(true);
    setStatus("");

    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("Supabase client not available.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus(error.message);
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  async function loadCollectionCards() {
    try {
      const supabase = getSupabaseClient();
      let headers: any = {};
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch("/api/collection", { headers });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to load collection.");
      }
      setCollectionCards(json.cards ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadBinders() {
    try {
      const supabase = getSupabaseClient();
      let headers: any = {};
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch("/api/binders", { headers });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to load binders.");
      }
      const binders = (json.binders ?? []).map((binder: any) => ({
        id: binder.id,
        name: binder.name,
      }));
      setBinders(binders);

      const assignments: Record<string, string[]> = {};
      (json.binders ?? []).forEach((binder: any) => {
        const cardIds = (binder.binder_cards ?? []).map((row: any) => row.collection_id).filter(Boolean);
        if (binder.id) {
          assignments[binder.id] = cardIds;
        }
      });
      setBinderAssignments(assignments);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadNewTrades() {
    try {
      const response = await fetch("/api/trades?is_listing=true&pageSize=8");
      const json = await response.json();
      if (response.ok) setNewTrades(json.items ?? []);
    } catch {
      setNewTrades([]);
    }
  }

  async function createBinder() {
    if (!binderName.trim()) {
      setBinderError("Binder name is required.");
      return;
    }

    setBinderError("");
    setBinderSuccess("");

    try {
      const supabase = getSupabaseClient();
      let headers: any = { "Content-Type": "application/json" };
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch("/api/binders", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: binderName.trim() }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to create binder.");
      }
if (!json.binder) {
  throw new Error("The binder was not created. Please try again.");
}

setBinders((prev) => [...prev, json.binder]);
setBinderName("");
setBinderSuccess(`Binder "${json.binder.name}" created.`);
    } catch (error) {
      setBinderError(error instanceof Error ? error.message : "Failed to create binder.");
    }
  }

  async function assignCardToBinder(cardId: string, binderId: string) {
    try {
      const supabase = getSupabaseClient();
      let headers: any = { "Content-Type": "application/json" };
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch("/api/collection/bind-to-binder", {
        method: "POST",
        headers,
        body: JSON.stringify({ collectionId: cardId, binderId }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to assign card to binder.");
      }
      setBinderAssignments((prev) => ({
        ...prev,
        [binderId]: [...(prev[binderId] ?? []), cardId],
      }));
      setBinderSuccess("Card moved into binder.");
    } catch (error) {
      setBinderError(error instanceof Error ? error.message : "Failed to assign card to binder.");
    }
  }

  async function updateBinder(id: string) {
    if (!editingBinderName.trim()) return setBinderError("Binder name is required.");
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/binders", { method: "PUT", headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) }, body: JSON.stringify({ id, name: editingBinderName.trim() }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to rename binder.");
      setBinders((current) => current.map((binder) => binder.id === id ? json.binder : binder));
      setEditingBinderId(null);
      setBinderSuccess("Binder renamed.");
    } catch (error) {
      setBinderError(error instanceof Error ? error.message : "Unable to rename binder.");
    }
  }

  async function deleteBinder(id: string, name: string) {
    if (!window.confirm(`Delete the binder "${name}"? Your cards will remain in your collection.`)) return;
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/binders", { method: "DELETE", headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) }, body: JSON.stringify({ id }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to delete binder.");
      setBinders((current) => current.filter((binder) => binder.id !== id));
      setBinderAssignments((current) => { const next = { ...current }; delete next[id]; return next; });
      setBinderSuccess("Binder deleted. Your cards are still in your collection.");
    } catch (error) {
      setBinderError(error instanceof Error ? error.message : "Unable to delete binder.");
    }
  }

  async function deleteCollectionCard(id: string, name: string) {
    if (!window.confirm(`Remove "${name}" from your collection? This cannot be undone.`)) return;
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/collection", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
        },
        body: JSON.stringify({ id }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to remove card.");
      setCollectionCards((current) => current.filter((card) => card.id !== id));
      if (selectedCard?.id === id) setSelectedCard(null);
      setBinderAssignments((current) => Object.fromEntries(Object.entries(current).map(([binderId, cardIds]) => [binderId, cardIds.filter((cardId) => cardId !== id)])));
      setStatus("Card removed from your collection.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to remove card.");
    }
  }

  function openCard(card: CollectionCard) {
    setSelectedCard(card);
    setCardDraft({
      quantity_owned: String(card.quantity_owned ?? 1),
      current_market_value: String(card.current_market_value ?? card.price ?? ""),
      estimated_condition: card.estimated_condition ?? "",
      is_graded: Boolean(card.estimated_grade),
      estimated_grade: card.estimated_grade ?? "",
      personal_notes: card.personal_notes ?? "",
    });
  }

  async function saveCard() {
    if (!selectedCard) return;
    setSavingCard(true);
    setStatus("");
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/collection", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
        body: JSON.stringify({ id: selectedCard.id, ...cardDraft }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to save card details.");
      setCollectionCards((current) => current.map((card) => card.id === selectedCard.id ? json.item : card));
      setSelectedCard(json.item);
      setStatus("Card details saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save card details.");
    } finally {
      setSavingCard(false);
    }
  }

  async function addConditionPhotos(cardId: string, files: FileList | null) {
    if (!files?.length) return;
    const remaining = Math.max(0, 4 - (conditionPhotos[cardId]?.length ?? 0));
    const selected = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, remaining);
    const photos = await Promise.all(selected.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unable to read photo."));
      reader.onerror = () => reject(new Error("Unable to read photo."));
      reader.readAsDataURL(file);
    })));
    setConditionPhotos((current) => ({ ...current, [cardId]: [...(current[cardId] ?? []), ...photos].slice(0, 4) }));
  }

  function listCollectionCard(card: (typeof collectionCards)[number]) {
    const cardTitle = [card.card_set, card.card_name, card.card_number].filter(Boolean).join(" · ");
    const photos = conditionPhotos[card.id] ?? (card.image_url ? [card.image_url] : []);
    if (photos.length < 4) {
      setPhotoCardId(card.id);
      setStatus("Add at least 4 condition photos before listing this card for trade.");
      return;
    }
    window.sessionStorage.setItem("pull-theory-listing-draft", JSON.stringify({
      offeredCard: cardTitle,
      notes: card.personal_notes ?? "",
      photos,
    }));
    router.push("/marketplace/list");
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, cardId: string) {
    event.dataTransfer.setData("text/plain", cardId);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleBinderDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOverBinder(event.currentTarget.dataset.binderId ?? null);
  }

  function handleBinderDragLeave() {
    setDragOverBinder(null);
  }

  async function handleBinderDrop(event: DragEvent<HTMLDivElement>, binderId: string) {
    event.preventDefault();
    setDragOverBinder(null);
    const cardId = event.dataTransfer.getData("text/plain");
    if (cardId) {
      await assignCardToBinder(cardId, binderId);
    }
  }

  useEffect(() => {}, []);

  useEffect(() => {
    loadCollectionCards();
    loadBinders();
    loadNewTrades();
    const interval = window.setInterval(loadNewTrades, 15000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(124,58,237,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Collector dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">Your collection overview</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Track portfolio value, market trends, and your top cards all in one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <></>
            </div>
          </div>
          {status && (
            <p className="rounded-3xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
              {status}
            </p>
          )}
          
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Portfolio value</p>
            <p className="mt-4 text-4xl font-semibold text-white">{portfolioValue.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Starts at $0 and grows as you add cards to your collection.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">New trades</p>
            <p className="mt-4 text-4xl font-semibold text-white">{newTrades.length}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Active marketplace listings, refreshed automatically every 15 seconds.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Cards in collection</p>
            <p className="mt-4 text-4xl font-semibold text-white">{collectionCards.length}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">A real count of the cards you have added to Pull Theory.</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Binders</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Organize cards into binders</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">Create named binders and drag cards from your collection into them.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <label htmlFor="binderName" className="text-sm uppercase tracking-[0.24em] text-emerald-300">New binder</label>
                    <input
                      id="binderName"
                      value={binderName}
                      onChange={(event) => setBinderName(event.target.value)}
                      placeholder="Binder name"
                      className="mt-3 w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={createBinder}
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  >
                    Create binder
                  </button>
                </div>
                {binderError && (
                  <p className="mt-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{binderError}</p>
                )}
                {binderSuccess && (
                  <p className="mt-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{binderSuccess}</p>
                )}
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Binder list</p>
                <div className="mt-4 space-y-3">
                  {binders.length ? binders.filter(Boolean).map((binder) => (
  <div
    key={binder.id}
    data-binder-id={binder.id}
    onDragOver={handleBinderDragOver}
    onDragLeave={handleBinderDragLeave}
    onDrop={(event) => handleBinderDrop(event, binder.id)}
    className={`rounded-3xl border p-4 transition ${
      dragOverBinder === binder.id
        ? "border-emerald-300 bg-emerald-500/10"
        : "border-white/10"
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
          Binder
        </p>
        {editingBinderId === binder.id ? <div className="mt-2 flex gap-2"><input autoFocus value={editingBinderName} onChange={(event) => setEditingBinderName(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-emerald-300/40 bg-black/40 px-3 py-2 text-sm text-white outline-none" /><button type="button" onClick={() => updateBinder(binder.id)} className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-bold text-black">Save</button><button type="button" onClick={() => setEditingBinderId(null)} className="rounded-xl border border-white/15 px-3 py-2 text-xs">Cancel</button></div> : <p className="mt-1 text-lg font-semibold text-white">{binder.name}</p>}
      </div>
      {editingBinderId !== binder.id && <div className="flex shrink-0 gap-2"><button type="button" onClick={() => { setEditingBinderId(binder.id); setEditingBinderName(binder.name); }} className="rounded-xl border border-white/15 px-3 py-2 text-xs text-zinc-200 hover:border-violet-300/50">Edit</button><button type="button" onClick={() => deleteBinder(binder.id, binder.name)} className="rounded-xl border border-rose-400/25 px-3 py-2 text-xs text-rose-200 hover:bg-rose-400/10">Delete</button></div>}
    </div>
  </div>
)) : (
  <div className="rounded-2xl border border-dashed border-white/15 p-4 text-sm leading-6 text-zinc-400"><p className="font-semibold text-white">Your first binder is waiting.</p><p className="mt-1">Create a binder for your favorite Pokémon, master set, trade inventory, or personal collection.</p></div>
)}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <h2 className="text-xl font-semibold text-white">Collection cards</h2>
            <div className="mt-6 space-y-4">
              {collectionCards.length ? (
                collectionCards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, card.id)}
                    className="group rounded-[1.75rem] border border-white/10 bg-black/30 p-4 transition hover:border-emerald-400"
                  >
                    <div className="flex items-start gap-4">
                      {card.image_url ? (
                        <button type="button" onClick={() => openCard(card)} className="shrink-0 transition hover:scale-[1.03]" aria-label={`View ${card.card_name}`}>
                          <img src={card.image_url} alt={card.card_name} className="h-20 w-16 rounded-2xl object-cover" />
                        </button>
                      ) : (
                        <button type="button" onClick={() => openCard(card)} className="flex h-20 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-sm text-zinc-400 transition hover:bg-white/10">No image</button>
                      )}
                      <div className="flex-1">
                        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">{card.card_set}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{card.card_name}</p>
                        <p className="mt-1 text-sm text-zinc-400">{card.card_number} · {card.language}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2"><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">Drag</span><button type="button" onClick={() => openCard(card)} className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-violet-300/60">View / edit</button><button type="button" onClick={() => listCollectionCard(card)} className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500">List it</button><button type="button" onClick={() => deleteCollectionCard(card.id, card.card_name)} className="rounded-xl border border-rose-400/30 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10">Delete</button></div>
                    </div>
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <button type="button" onClick={() => setPhotoCardId(photoCardId === card.id ? null : card.id)} className="text-sm font-semibold text-violet-300 transition hover:text-violet-200">
                        {photoCardId === card.id ? "Hide condition photos" : "Add condition photos (optional)"}
                      </button>
                      {photoCardId === card.id && <div className="mt-3 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4"><p className="text-sm text-zinc-300">Add four clear photos—front, back, corners, and any flaws—before offering this card for trade. Add them all at once or one at a time.</p><p className="mt-2 text-xs font-semibold text-violet-200">{conditionPhotos[card.id]?.length ?? 0}/4 photos added</p><label className="mt-3 inline-flex cursor-pointer rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:border-violet-300/60">Add photos<input type="file" accept="image/*" multiple className="hidden" onChange={(event) => { addConditionPhotos(card.id, event.target.files); event.currentTarget.value = ""; }} /></label>{conditionPhotos[card.id]?.length ? <div className="mt-4 grid grid-cols-4 gap-2">{conditionPhotos[card.id].map((photo, index) => <div key={photo} className="relative"><img src={photo} alt={`${card.card_name} condition ${index + 1}`} className="aspect-square rounded-xl object-cover" /><button type="button" aria-label="Remove photo" onClick={() => setConditionPhotos((current) => ({ ...current, [card.id]: current[card.id].filter((_, photoIndex) => photoIndex !== index) }))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs text-white">×</button></div>)}</div> : <p className="mt-3 text-xs text-zinc-500">No condition photos added yet.</p>}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-zinc-400">No cards in your collection yet.</p>
              )}
            </div>
          </div>
        </section>

        {selectedCard && <div className="fixed inset-0 z-[90] flex items-end bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Edit ${selectedCard.card_name}`}>
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] border border-white/15 bg-[#111017] p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Collection card</p><h2 className="mt-2 text-2xl font-semibold text-white">{selectedCard.card_name}</h2><p className="mt-1 text-sm text-zinc-400">{[selectedCard.card_set, selectedCard.card_number].filter(Boolean).join(" · ")}</p></div><button type="button" onClick={() => setSelectedCard(null)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-xl text-zinc-300 transition hover:bg-white/10" aria-label="Close card details">×</button></div>
            <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><div>{selectedCard.image_url ? <img src={selectedCard.image_url} alt={selectedCard.card_name} className="mx-auto max-h-[34rem] w-full rounded-3xl border border-white/10 bg-black/30 object-contain" /> : <div className="grid aspect-[5/7] place-items-center rounded-3xl border border-dashed border-white/15 bg-black/30 text-zinc-500">No card image available</div>}<div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-300"><p><span className="text-zinc-500">Rarity:</span> {selectedCard.rarity || "Not recorded"}</p><p className="mt-2"><span className="text-zinc-500">Language:</span> {selectedCard.language || "Not recorded"}</p></div></div><div><p className="text-sm font-semibold text-white">Card details</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm text-zinc-300">Quantity<input type="number" min="1" value={cardDraft.quantity_owned} onChange={(event) => setCardDraft((current) => ({ ...current, quantity_owned: event.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-violet-400" /></label><label className="text-sm text-zinc-300">Market value (each)<input inputMode="decimal" value={cardDraft.current_market_value} onChange={(event) => setCardDraft((current) => ({ ...current, current_market_value: event.target.value }))} placeholder="$0.00" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-violet-400" /></label><label className="text-sm text-zinc-300 sm:col-span-2">Condition<input value={cardDraft.estimated_condition} onChange={(event) => setCardDraft((current) => ({ ...current, estimated_condition: event.target.value }))} placeholder="Near mint, lightly played, etc." className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-violet-400" /></label></div><label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-violet-300/20 bg-violet-500/[0.08] p-4 text-sm font-semibold text-white"><input type="checkbox" checked={cardDraft.is_graded} onChange={(event) => setCardDraft((current) => ({ ...current, is_graded: event.target.checked }))} className="h-4 w-4 accent-violet-500" />This card is professionally graded</label>{cardDraft.is_graded && <label className="mt-4 block text-sm text-zinc-300">Grader and grade<input value={cardDraft.estimated_grade} onChange={(event) => setCardDraft((current) => ({ ...current, estimated_grade: event.target.value }))} placeholder="Example: PSA 10" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-violet-400" /></label>}<label className="mt-5 block text-sm text-zinc-300">Personal notes<textarea value={cardDraft.personal_notes} onChange={(event) => setCardDraft((current) => ({ ...current, personal_notes: event.target.value }))} rows={4} placeholder="Condition notes, acquisition details, etc." className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-violet-400" /></label><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={saveCard} disabled={savingCard} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60">{savingCard ? "Saving..." : "Save changes"}</button><button type="button" onClick={() => deleteCollectionCard(selectedCard.id, selectedCard.card_name)} className="rounded-xl border border-rose-400/30 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10">Delete card</button></div></div></div>
          </div>
        </div>}

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">Built around your real collection</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Pull Theory only shows activity that belongs to you.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Add cards, create a binder, or browse the marketplace. Your collection and trade activity will appear here as you use the platform.</p>
        </section>
      </div>
    </main>
  );
}
