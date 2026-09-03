"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCurrentAccessToken } from "../lib/supabase";

type Party = {
  name: string;
  email: string;
  shippingAddress: string;
  offeredCard: string;
};
type Shipment = {
  offer: Party & { id: number; status?: string };
  listing: Party & { id: number };
};
type Traffic = {
  today: number;
  week: number;
  allTime: number;
  pageViews: number;
  daily: Array<{ label: string; visitors: number }>;
  pages: Array<{ path: string; views: number; visitors: number }>;
  onePageVisitors: number;
  funnel: Array<{ id: string; label: string; visitors: number }>;
};
type SignupSummary = { today: number; week: number; allTime: number };
type LifecycleStep = { id: string; label: string; members: number };
const steps = [
  ["awaiting_shipment", "Awaiting shipment"],
  ["received", "Cards received"],
  ["authenticated", "Authentication complete"],
  ["return_shipped", "Shipped back"],
  ["completed", "Mark completed"],
] as const;

export default function PullShieldDeskPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [signups, setSignups] = useState<SignupSummary | null>(null);
  const [lifecycle, setLifecycle] = useState<LifecycleStep[] | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [queue, setQueue] = useState<
    | "all"
    | "awaiting_shipment"
    | "received"
    | "authenticated"
    | "return_shipped"
    | "completed"
    | "cancelled"
  >("all");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to open PullShield Desk.");
      const response = await fetch("/api/pullshield", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to open PullShield Desk.");
      setShipments(data.shipments ?? []);
      setTraffic(data.traffic ?? null);
      setSignups(data.signups ?? null);
      setLifecycle(data.lifecycle ?? null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load shipments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function update(offerId: number, status: string) {
    setSaving(offerId);
    setMessage("");
    try {
      const token = await getCurrentAccessToken();
      if (!token) throw new Error("Please sign in to update this shipment.");
      const reason =
        status === "cancelled"
          ? window
              .prompt(
                "Why is this trade being cancelled? This explanation will be emailed to both collectors.",
              )
              ?.trim()
          : undefined;
      if (status === "cancelled" && !reason) return;
      const response = await fetch("/api/pullshield", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ offerId, status, reason }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to update shipment.");
      setMessage(
        "Tracker updated. Both collectors have been notified when email delivery is configured.",
      );
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update shipment.",
      );
    } finally {
      setSaving(null);
    }
  }

  const queues = [
    ["all", "All"],
    ["awaiting_shipment", "Awaiting cards"],
    ["received", "Inspecting"],
    ["authenticated", "Ready to ship"],
    ["return_shipped", "On the way back"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ] as const;
  const counts = Object.fromEntries(
    queues.map(([id]) => [
      id,
      id === "all"
        ? shipments.length
        : shipments.filter(({ offer }) => offer.status === id).length,
    ]),
  );
  const visibleShipments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shipments.filter(
      ({ offer, listing }) =>
        (queue === "all" || offer.status === queue) &&
        (!query ||
          [
            offer.id,
            offer.name,
            offer.email,
            offer.offeredCard,
            listing.name,
            listing.email,
            listing.offeredCard,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)),
    );
  }, [queue, search, shipments]);

  return (
    <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-amber-300/20 bg-[radial-gradient(circle_at_82%_0%,rgba(251,191,36,0.17),transparent_44%),rgba(255,255,255,0.035)] p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
            Private operations
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                PullShield Desk.
              </h1>
              <p className="mt-4 max-w-2xl text-zinc-300">
                Work through your authentication queue one clear step at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/giveaway" className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200">Giveaway entries</Link>
              <button
                onClick={() => void load()}
                className="rounded-xl border border-amber-300/35 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10"
              >
                Refresh desk
              </button>
            </div>
          </div>
        </section>
        {message && (
          <p className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">
            {message}
          </p>
        )}
        <section className="mt-8 rounded-3xl border border-emerald-300/20 bg-emerald-400/[0.06] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Website traffic
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Collector activity</h2>
          {traffic ? (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                {[
                  ["Today", traffic.today],
                  ["Last 7 days", traffic.week],
                  ["All-time visitors", traffic.allTime],
                  ["Page views", traffic.pageViews],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {traffic.daily.map((day) => (
                  <div
                    key={day.label}
                    className="rounded-xl bg-black/20 p-3 text-center"
                  >
                    <p className="text-xs text-zinc-400">{day.label}</p>
                    <p className="mt-2 text-lg font-semibold text-emerald-200">
                      {day.visitors}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-emerald-300/15 pt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Page activity</p><p className="text-sm text-zinc-300"><span className="font-semibold text-amber-200">{traffic.onePageVisitors}</span> visitors have only viewed one page</p></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{traffic.pages.map((page) => <div key={page.path} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="truncate text-sm font-semibold text-white">{page.path}</p><p className="mt-2 text-xs text-zinc-400">{page.views} page views · {page.visitors} visitors</p></div>)}</div>
                <p className="mt-4 text-xs leading-5 text-zinc-500">“Only viewed one page” is an activity signal, not proof that someone immediately left. The dashboard never records names, emails, or browsing outside Pull Theory.</p>
              </div>
              <div className="mt-8 border-t border-emerald-300/15 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Sign-up funnel</p>
                <p className="mt-2 text-sm text-zinc-300">Anonymous unique visitors at each step, starting from when this tracker was added.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {traffic.funnel.map((step, index) => <div key={step.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{index + 1}. {step.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-200">{step.visitors}</p>
                  </div>)}
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-zinc-300">
              Traffic tracking will appear here once the secure visit log is
              connected.
            </p>
          )}
          {signups && (
            <div className="mt-8 border-t border-emerald-300/15 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Account sign-ups</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[["Today", signups.today], ["Last 7 days", signups.week], ["All-time accounts", signups.allTime]].map(([label, value]) => (
                  <div key={String(label)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-200">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {lifecycle && (
            <div className="mt-8 border-t border-emerald-300/15 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Full member lifecycle</p>
              <p className="mt-2 text-sm text-zinc-300">Each milestone counts a member once. Conversion is measured from the step immediately above it.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lifecycle.map((step, index) => {
                  const previous = lifecycle[index - 1]?.members ?? step.members;
                  const conversion = index === 0 ? 100 : previous ? Math.round((step.members / previous) * 100) : 0;
                  return <div key={step.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">{index + 1}. {step.label}</p><p className="mt-2 text-3xl font-semibold text-emerald-200">{step.members}</p><p className="mt-2 text-xs font-semibold text-violet-200">{index === 0 ? "Starting point" : `${conversion}% from previous step`}</p></div>;
                })}
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-500">Visitor and sign-up-started counts are anonymous browser activity. All later milestones are private, one-time account events. This is a funnel signal, not a guarantee that each anonymous visitor maps to a specific account.</p>
            </div>
          )}
        </section>
        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                Authentication queue
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Manage trades</h2>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search trade, card, or collector…"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-300 sm:max-w-sm"
            />
          </div>
          <div className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-2">
            {queues.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setQueue(id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${queue === id ? "bg-violet-500 text-white" : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.09]"}`}
              >
                {label} <span className="ml-1 opacity-70">{counts[id]}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-5">
            {loading ? (
              <p className="text-zinc-400">Loading protected shipments...</p>
            ) : visibleShipments.length ? (
              visibleShipments.map(({ offer, listing }) => {
                const status = offer.status ?? "awaiting_shipment";
                const action =
                  status === "awaiting_shipment"
                    ? ["received", "Mark cards received"]
                    : status === "received"
                      ? ["authenticated", "Mark authentication complete"]
                      : status === "authenticated"
                        ? ["return_shipped", "Mark shipped back"]
                        : status === "return_shipped"
                          ? ["completed", "Mark trade completed"]
                          : null;
                return (
                  <article
                    key={offer.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                          Trade #{offer.id}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">
                          {listing.offeredCard}{" "}
                          <span className="text-violet-300">↔</span>{" "}
                          {offer.offeredCard}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-400">
                          {listing.name} and {offer.name}
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold capitalize text-amber-100">
                        {status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <details className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                      <summary className="cursor-pointer text-sm font-semibold text-violet-200">
                        View collectors’ shipping information
                      </summary>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                            Listing owner
                          </p>
                          <p className="mt-3 font-semibold">{listing.name}</p>
                          <p className="mt-1 break-all text-sm text-zinc-300">
                            {listing.email}
                          </p>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
                            {listing.shippingAddress}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                            Offer sender
                          </p>
                          <p className="mt-3 font-semibold">{offer.name}</p>
                          <p className="mt-1 break-all text-sm text-zinc-300">
                            {offer.email}
                          </p>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
                            {offer.shippingAddress}
                          </p>
                        </div>
                      </div>
                    </details>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {action && (
                        <button
                          disabled={saving === offer.id}
                          onClick={() => void update(offer.id, action[0])}
                          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:opacity-50"
                        >
                          {saving === offer.id ? "Saving..." : action[1]}
                        </button>
                      )}
                      {status !== "completed" && status !== "cancelled" && (
                        <button
                          disabled={saving === offer.id}
                          onClick={() => void update(offer.id, "cancelled")}
                          className="ml-auto rounded-xl border border-rose-400/45 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:opacity-50"
                        >
                          Cancel trade
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
                No trades match this view.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
