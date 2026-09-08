"use client";

import { useState } from "react";
import { getCurrentAccessToken } from "../lib/supabase";

export default function BuyNowButton({ listingId, priceCents, className = "" }: { listingId: number; priceCents: number; className?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function buy() {
    setLoading(true);
    setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) {
        window.location.assign(`/signup?returnTo=${encodeURIComponent(`/marketplace/${listingId}`)}`);
        return;
      }
      const response = await fetch("/api/sales/checkout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ listingId }) });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Unable to open secure checkout.");
      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to open secure checkout.");
      setLoading(false);
    }
  }

  return <div><button type="button" disabled={loading} onClick={() => void buy()} className={`rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60 ${className}`}>{loading ? "Opening checkout..." : `Buy now · ${(priceCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}`}</button>{message && <p className="mt-2 text-xs text-rose-200">{message}</p>}</div>;
}
