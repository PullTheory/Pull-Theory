"use client";

import { useEffect, useState } from "react";
import { getCurrentAccessToken, getSupabaseClient } from "../lib/supabase";
import { getTraderBadge } from "../lib/traderBadges";

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [membershipMessage, setMembershipMessage] = useState("");
  const [openingPortal, setOpeningPortal] = useState(false);
  const [cancellingMembership, setCancellingMembership] = useState(false);

  async function manageMembership() {
    setOpeningPortal(true); setMembershipMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to manage your membership.");
      const response = await fetch("/api/stripe/portal", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to open membership settings.");
      window.location.assign(data.url);
    } catch (error) { setMembershipMessage(error instanceof Error ? error.message : "Unable to open membership settings."); }
    finally { setOpeningPortal(false); }
  }

  async function cancelMembership() {
    if (!window.confirm("Cancel your membership at the end of your current paid billing period? You will keep access until then.")) return;

    setCancellingMembership(true);
    setMembershipMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to cancel your membership.");
      const response = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to cancel membership.");
      setMembershipMessage(data.message ?? "Your membership is scheduled to end after the current paid billing period.");
    } catch (error) {
      setMembershipMessage(error instanceof Error ? error.message : "Unable to cancel membership.");
    } finally {
      setCancellingMembership(false);
    }
  }

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const u = data?.session?.user || null;
      setUser(u);

      try {
        const res = await fetch(`/api/trades?user_id=${u?.id}&page=1&pageSize=200`);
        const data = await res.json();
        setTrades(data?.items || []);
      } catch (e) {
        setTrades([]);
      }
    }
    load();
  }, []);

  if (!user) {
    return (
      <main className="min-h-screen px-6 py-12 text-white">
        <div className="mx-auto max-w-2xl">Please sign in to view your profile.</div>
      </main>
    );
  }

  const verifiedTrades = trades.filter((trade) => trade.status === "verified").length;
  const badge = getTraderBadge(verifiedTrades);

  return (
    <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 rounded-3xl border border-white/15 bg-white/[0.06] p-7 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">Collector profile</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Profile</h1>
          <p className="mt-2 break-all text-sm font-medium text-zinc-200">{user.email}</p>
          {badge ? (
            <span title={badge.description} className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge.color}`}>
              ✓ {badge.label} · {badge.verifiedTrades} authenticated trades
            </span>
          ) : (
            <p className="mt-3 text-sm font-medium text-zinc-200">Complete 10 authenticated trades to earn the Novice Trader badge.</p>
          )}
        </header>

        <section className="mb-6 rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] p-5">
          <h2 className="text-xl font-semibold text-white">Membership</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-zinc-100">You can manage your plan or cancel it at any time. If you cancel, your access remains active through the end of your paid billing period.</p>
          {membershipMessage && <p className="mt-3 text-sm text-amber-200">{membershipMessage}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={openingPortal} onClick={() => void manageMembership()} className="rounded-xl border border-violet-300/40 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/15 disabled:opacity-60">{openingPortal ? "Opening..." : "Manage billing"}</button>
            <button type="button" disabled={cancellingMembership} onClick={() => void cancelMembership()} className="rounded-xl border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/15 disabled:opacity-60">{cancellingMembership ? "Cancelling..." : "Cancel membership"}</button>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-white/15 bg-white/[0.045] p-6">
          <h2 className="text-xl font-semibold text-white">Your listings & offers</h2>
          <ul className="mt-3 space-y-3">
            {trades.length ? trades.map((t) => (
              <li key={t.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="font-semibold text-white">{t.is_listing ? 'Listing' : 'Offer'} — {t.offeredCard}</div>
                <div className="mt-1 text-sm font-medium text-zinc-200">Status: {t.status || 'open'}</div>
              </li>
            )) : <li className="text-sm font-medium text-zinc-200">No listings or offers yet.</li>}
          </ul>
        </section>
      </div>
    </main>
  );
}
