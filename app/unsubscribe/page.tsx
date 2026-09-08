"use client";
import { useEffect, useState } from "react";
export default function UnsubscribePage() {
  const [message, setMessage] = useState("Updating your email preference...");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get("u"); const s = params.get("s");
    if (!u || !s) { setMessage("This preference link is invalid."); return; }
    fetch(`/api/marketing/unsubscribe?u=${encodeURIComponent(u)}&s=${encodeURIComponent(s)}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update your preference.");
      setMessage("You will no longer receive PullTheory product and marketing updates. Important account and transaction emails can still be sent.");
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Unable to update your preference."));
  }, []);
  return <main className="min-h-screen bg-[#050506] px-6 py-20 text-white"><div className="mx-auto max-w-xl rounded-3xl border border-violet-400/20 bg-violet-500/10 p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">PullTheory email preferences</p><h1 className="mt-3 text-3xl font-semibold">Email preferences</h1><p className="mt-5 leading-7 text-zinc-300">{message}</p><a href="/" className="mt-8 inline-block rounded-xl bg-violet-500 px-5 py-3 font-semibold text-white hover:bg-violet-400">Return to PullTheory</a></div></main>;
}
