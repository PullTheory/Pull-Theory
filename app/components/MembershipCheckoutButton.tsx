"use client";

import { useState } from "react";
import { getSupabaseClient } from "../lib/supabase";
import type { PaidPlan } from "../lib/stripePlans";

export default function MembershipCheckoutButton({ plan, children, featured = false }: { plan: PaidPlan; children: React.ReactNode; featured?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function beginCheckout() {
    setLoading(true);
    setMessage("");
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const token = data.session?.access_token;
      if (!token) {
        window.location.href = `/signup?plan=${plan}`;
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Unable to start checkout.");
      window.location.href = result.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start checkout.");
      setLoading(false);
    }
  }

  return <div className="mt-8"><button type="button" disabled={loading} onClick={beginCheckout} className={`block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${featured ? "bg-violet-500 text-white hover:bg-violet-400" : "border border-white/15 text-white hover:border-violet-300/60 hover:bg-white/[0.06]"}`}>{loading ? "Opening secure checkout..." : children}</button>{message && <p className="mt-3 text-center text-xs text-rose-200">{message}</p>}</div>;
}
