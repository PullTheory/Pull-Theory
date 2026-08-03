"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [scanError, setScanError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    cardName: string;
    setName: string;
    side: string;
    estimatedValue: string;
    condition: string;
    centering: string;
    whitening: string;
    psaGrade: string;
    cropBounds: { x: number; y: number; width: number; height: number } | string;
    notes: string;
  } | null>(null);
  const [collectionCards, setCollectionCards] = useState<Array<{
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
  }>>([]);
  const [binders, setBinders] = useState<Array<{ id: string; name: string }>>([]);
  const [binderName, setBinderName] = useState("");
  const [binderError, setBinderError] = useState("");
  const [binderSuccess, setBinderSuccess] = useState("");
  const [binderAssignments, setBinderAssignments] = useState<Record<string, string[]>>({});
  const [dragOverBinder, setDragOverBinder] = useState<string | null>(null);

  async function handleStartScan() {
    setScanError("");
    setCapturedImage(null);
    setScanOpen(true);
    setIsScanning(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (error) {
      setScanError("Unable to access camera. Please allow camera permission and try again.");
      setScanOpen(false);
    } finally {
      setIsScanning(false);
    }
  }

  function handleStopScan() {
    setScanOpen(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
  }

  async function handleScan() {
    if (scanOpen) {
      handleStopScan();
      return;
    }

    await handleStartScan();
  }

  async function handleLogout() {
    setLoading(true);
    setStatus("");

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
      const response = await fetch("/api/collection");
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
      const response = await fetch("/api/binders");
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

  async function createBinder() {
    if (!binderName.trim()) {
      setBinderError("Binder name is required.");
      return;
    }

    setBinderError("");
    setBinderSuccess("");

    try {
      const response = await fetch("/api/binders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: binderName.trim() }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to create binder.");
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
      const response = await fetch("/api/collection/bind-to-binder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    loadCollectionCards();
    loadBinders();
  }, []);

  return (
    <main className="min-h-screen bg-[#050506] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(124,58,237,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Collector dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">Your collection overview</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Track portfolio value, market trends, and your top cards all in one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleScan}
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                {scanOpen ? "Stop scan" : "Scan card"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/search")}
                className="inline-flex items-center justify-center rounded-full bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
              >
                Search card
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
          {status && (
            <p className="rounded-3xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
              {status}
            </p>
          )}
          {scanOpen && (
            <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Camera scan</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Use your phone camera to scan a card. Tap capture once the card is visible.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleStopScan}
                    className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                  >
                    Stop
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        const canvas = document.createElement("canvas");
                        canvas.width = videoRef.current.videoWidth;
                        canvas.height = videoRef.current.videoHeight;
                        const context = canvas.getContext("2d");
                        if (!context) return;
                        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                        const captured = canvas.toDataURL("image/jpeg");

                        const cropSize = Math.min(canvas.width, canvas.height) * 0.86;
                        const cropX = Math.round((canvas.width - cropSize) / 2);
                        const cropY = Math.round((canvas.height - cropSize) / 2);
                        const cropCanvas = document.createElement("canvas");
                        cropCanvas.width = cropSize;
                        cropCanvas.height = cropSize;
                        const cropContext = cropCanvas.getContext("2d");
                        if (cropContext) {
                          cropContext.drawImage(canvas, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);
                          setCroppedImage(cropCanvas.toDataURL("image/jpeg"));
                        } else {
                          setCroppedImage(captured);
                        }

                        setCapturedImage(captured);
                        setScanResult(null);
                      }
                    }}
                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  >
                    Capture
                  </button>
                  <button
                    type="button"
                    disabled={!(capturedImage || croppedImage) || analyzing}
                    onClick={async () => {
                      const imageToAnalyze = croppedImage || capturedImage;
                      if (!imageToAnalyze) {
                        setScanError("Capture an image first.");
                        return;
                      }
                      setAnalyzing(true);
                      setScanError("");
                      setScanResult(null);
                      try {
                        const response = await fetch("/api/scan-card", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ image: imageToAnalyze }),
                        });
                        const data = await response.json();
                        if (!response.ok) {
                          throw new Error(data.error || "AI scan failed.");
                        }
                        setScanResult(data.result ?? null);
                      } catch (error) {
                        setScanError(error instanceof Error ? error.message : "AI scan failed.");
                      } finally {
                        setAnalyzing(false);
                      }
                    }}
                    className="rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {analyzing ? "Analyzing..." : "Analyze"}
                  </button>
                </div>
              </div>
              {scanError && (
                <p className="mt-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {scanError}
                </p>
              )}
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/30">
                  <video ref={videoRef} className="h-72 w-full object-cover" playsInline muted />
                </div>
                {capturedImage && (
                  <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/30">
                    <img src={capturedImage} alt="Captured card" className="h-72 w-full object-cover" />
                  </div>
                )}
                {croppedImage && (
                  <div className="rounded-3xl overflow-hidden border border-amber-300/20 bg-black/30">
                    <img src={croppedImage} alt="Cropped card" className="h-72 w-full object-cover" />
                    <p className="p-3 text-xs uppercase tracking-[0.24em] text-amber-300">Auto-cropped preview</p>
                  </div>
                )}
              </div>
              {scanResult && (
                <div className="mt-6 rounded-[1.75rem] border border-emerald-500/20 bg-emerald-500/5 p-6 text-sm text-white">
                  <h2 className="text-xl font-semibold text-white">AI Card Analysis</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Card name</p>
                      <p className="mt-1 text-lg font-semibold">{scanResult.cardName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Set / edition</p>
                      <p className="mt-1 text-white">{scanResult.setName}</p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Side detected</p>
                        <p className="mt-1 text-lg font-semibold">{scanResult.side}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">PSA grade estimate</p>
                        <p className="mt-1 text-lg font-semibold">{scanResult.psaGrade}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Estimated value</p>
                        <p className="mt-1 text-lg font-semibold">{scanResult.estimatedValue}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Condition</p>
                        <p className="mt-1 text-lg font-semibold">{scanResult.condition}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Centering</p>
                        <p className="mt-1 text-lg font-semibold">{scanResult.centering}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Whitening</p>
                        <p className="mt-1 text-lg font-semibold">{scanResult.whitening}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Crop bounds</p>
                        <p className="mt-1 leading-6 text-zinc-200">{typeof scanResult.cropBounds === "string" ? scanResult.cropBounds : `x:${scanResult.cropBounds.x}, y:${scanResult.cropBounds.y}, w:${scanResult.cropBounds.width}, h:${scanResult.cropBounds.height}`}</p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Notes</p>
                      <p className="mt-1 leading-6 text-zinc-200">{scanResult.notes}</p>
                    </div>
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs uppercase tracking-[0.28em] text-zinc-500">
                Tip: Use the rear camera on mobile for best results.
              </p>
            </div>
          )}
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Portfolio value</p>
            <p className="mt-4 text-4xl font-semibold text-white">$18,240</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Real-time market valuation for your tracked cards.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">New insights</p>
            <p className="mt-4 text-4xl font-semibold text-white">12</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Collector intelligence updates based on your recent activity.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Trusted trades</p>
            <p className="mt-4 text-4xl font-semibold text-white">4</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Open offers and matches waiting in your network.</p>
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
                  {binders.length ? (
                    binders.map((binder) => (
                      <div
                        key={binder.id}
                        data-binder-id={binder.id}
                        onDragOver={handleBinderDragOver}
                        onDragLeave={handleBinderDragLeave}
                        onDrop={(event) => handleBinderDrop(event, binder.id)}
                        className={`rounded-3xl border p-4 transition ${dragOverBinder === binder.id ? "border-emerald-400 bg-emerald-500/10" : "border-white/10 bg-black/40"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">{binder.name}</p>
                            <p className="mt-1 text-sm text-zinc-400">{(binderAssignments[binder.id] ?? []).length} cards</p>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">Drop here</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-zinc-400">Create a binder to start organizing your cards.</p>
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
                        <img src={card.image_url} alt={card.card_name} className="h-20 w-16 rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-20 w-16 items-center justify-center rounded-2xl bg-white/5 text-sm text-zinc-400">No image</div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">{card.card_set}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{card.card_name}</p>
                        <p className="mt-1 text-sm text-zinc-400">{card.card_number} · {card.language}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">Drag</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-zinc-400">No cards in your collection yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <h2 className="text-xl font-semibold text-white">Top cards to watch</h2>
            <ul className="mt-6 space-y-4 text-sm text-zinc-300">
              <li className="rounded-3xl bg-black/30 p-4"><span className="font-semibold text-white">Blue-Eyes White Dragon</span> — Expected +8.4% next week</li>
              <li className="rounded-3xl bg-black/30 p-4"><span className="font-semibold text-white">Charizard #4</span> — Price momentum rising</li>
              <li className="rounded-3xl bg-black/30 p-4"><span className="font-semibold text-white">Pikachu Illustrator</span> — High-demand alert</li>
            </ul>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            <h2 className="text-xl font-semibold text-white">Recent activity</h2>
            <div className="mt-6 space-y-4 text-sm text-zinc-300">
              <div className="rounded-3xl bg-black/30 p-4">
                <p className="font-semibold text-white">Portfolio updated</p>
                <p className="mt-1">Your collection value was refreshed 3 minutes ago.</p>
              </div>
              <div className="rounded-3xl bg-black/30 p-4">
                <p className="font-semibold text-white">Trade recommendation</p>
                <p className="mt-1">New card match found with a trusted collector.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
