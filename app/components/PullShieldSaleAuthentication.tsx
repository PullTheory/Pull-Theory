"use client";

import { useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

type Props = { saleId: number; initialChecklist?: Record<string, boolean>; initialEvidence?: string[]; initialNotes?: string | null; disabled?: boolean; onApprove: (payload: { authenticationChecklist: Record<string, boolean>; authenticationEvidenceUrls: string[]; authenticationNotes: string }) => Promise<void> };
const checks = [
  ["card_identity", "Card identity", "Match card number, set, year, rarity, artwork, language and expected variant."],
  ["print_quality", "Print quality", "Check fonts, borders, colors, symbols, copyright text and print sharpness."],
  ["magnification", "10x magnification", "Inspect fine print, edges, text and print pattern under magnification."],
  ["card_construction", "Card construction", "Compare dimensions, thickness, stiffness, surface and edge construction."],
  ["holo_texture", "Holo / texture", "Confirm the holo pattern and embossed texture are correct for this exact card."],
  ["light_uv", "Controlled light / UV", "Inspect under angled neutral light and UV for unusual stock, coating or printing."],
  ["genuine_comparison", "Known-genuine comparison", "Compare against an authentic card/reference from the same era or set."],
  ["front_photo", "Front evidence photo", "Capture a clear, well-lit image of the entire card front."],
  ["back_photo", "Back evidence photo", "Capture a clear, well-lit image of the entire card back."],
] as const;

async function uploadEvidence(saleId: number, files: File[]) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Photo uploads are unavailable in this browser.");
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) throw new Error("Sign in before uploading authentication evidence.");
  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new Error("Authentication evidence must be image files.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Each evidence photo must be 10 MB or smaller.");
    const ext = file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${user.id}/pullshield-sale-${saleId}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("trade-card-photos").upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    if (error) throw new Error(`Unable to upload ${file.name}: ${error.message}`);
    urls.push(supabase.storage.from("trade-card-photos").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

export default function PullShieldSaleAuthentication({ saleId, initialChecklist = {}, initialEvidence = [], initialNotes = "", disabled, onApprove }: Props) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist);
  const [evidence, setEvidence] = useState<string[]>(initialEvidence);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const complete = checks.every(([key]) => checklist[key]) && evidence.length >= 2;
  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError("");
    try { const uploaded = await uploadEvidence(saleId, Array.from(files)); setEvidence((current) => [...current, ...uploaded].slice(0, 12)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to upload evidence."); }
    finally { setBusy(false); }
  }
  async function approve() { setBusy(true); setError(""); try { await onApprove({ authenticationChecklist: checklist, authenticationEvidenceUrls: evidence, authenticationNotes: notes }); } catch (err) { setError(err instanceof Error ? err.message : "Unable to approve authentication."); } finally { setBusy(false); } }
  return <div className="mt-5 rounded-2xl border border-amber-300/20 bg-black/20 p-5">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">PullShield authentication record</p><p className="mt-2 text-sm text-zinc-400">All checks and at least two evidence photos are required before seller payout can release.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${complete ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/10 text-amber-100"}`}>{complete ? "Ready" : `${checks.filter(([key]) => !checklist[key]).length} checks left`}</span></div>
    <div className="mt-5 space-y-2">{checks.map(([key, label, detail]) => <label key={key} className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3"><input type="checkbox" checked={Boolean(checklist[key])} disabled={disabled || busy} onChange={(e) => setChecklist((current) => ({ ...current, [key]: e.target.checked }))} className="mt-1 h-4 w-4 accent-emerald-400"/><span><span className="block text-sm font-semibold text-white">{label}</span><span className="mt-1 block text-xs leading-5 text-zinc-400">{detail}</span></span></label>)}</div>
    <div className="mt-5"><p className="text-sm font-semibold">Evidence photos <span className="text-zinc-500">({evidence.length}/12)</span></p><label className="mt-2 inline-flex cursor-pointer rounded-xl border border-violet-300/35 px-4 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-400/10"><input type="file" accept="image/*" multiple className="hidden" disabled={disabled || busy} onChange={(e) => void addPhotos(e.target.files)}/>{busy ? "Uploading..." : "Add verification photos"}</label>{evidence.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{evidence.map((url, index) => <div key={url} className="relative"><img src={url} alt={`Authentication evidence ${index + 1}`} className="aspect-[3/4] w-full rounded-lg border border-white/10 object-cover"/>{!disabled && <button type="button" onClick={() => setEvidence((current) => current.filter((item) => item !== url))} className="absolute right-1 top-1 rounded-full bg-black/80 px-2 py-1 text-xs">×</button>}</div>)}</div>}</div>
    <label className="mt-5 block"><span className="text-sm font-semibold">Authentication notes</span><textarea value={notes} disabled={disabled || busy} onChange={(e) => setNotes(e.target.value)} maxLength={4000} placeholder="Condition observations, comparison card used, loupe/UV findings, anything unusual..." className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-violet-300"/></label>
    {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
    {!disabled && <button type="button" disabled={!complete || busy} onClick={() => void approve()} className="mt-5 w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Saving..." : "Pass authentication + release payout"}</button>}
  </div>;
}
