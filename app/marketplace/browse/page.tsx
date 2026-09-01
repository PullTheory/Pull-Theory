"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OfferModal from "../../components/OfferModal";
import { getSupabaseClient } from "../../lib/supabase";
import { recordTrafficEvent } from "../../components/TrafficTracker";

type Listing = {
  id: number;
  name: string;
  offeredCard: string;
  desiredCard: string;
  notes?: string;
  user_id?: string | null;
  photoUrls?: string[];
  traderBadge?: {
    label: string;
    description: string;
    color: string;
    verifiedTrades: number;
  } | null;
};

export default function BrowseMarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelectedListing] = useState<Listing | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [checkingAccount, setCheckingAccount] = useState(true);

  function setSelected(listing: Listing | null) {
    if (listing && !userId) {
      window.location.assign("/signup");
      return;
    }
    setSelectedListing(listing);
  }

  async function loadListings() {
    setLoading(true);
    try {
      const response = await fetch("/api/trades?is_listing=true&pageSize=100");
      const data = await response.json();
      setListings(response.ok ? (data.items ?? []) : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadUser() {
      const supabase = getSupabaseClient();
      const { data } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };
      const signedInUserId = data.session?.user.id ?? null;
      setUserId(signedInUserId);
      setCheckingAccount(false);
      if (signedInUserId) void loadListings();
      else void recordTrafficEvent("marketplace_gate_seen");
    }
    void loadUser();
  }, []);

  async function deleteListing(listing: Listing) {
    if (
      !window.confirm(
        `Delete your listing for ${listing.offeredCard}? Pending offers for it will also be removed. This cannot be undone.`,
      )
    )
      return;
    setDeletingId(listing.id);
    setMessage("");
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };
      const token = data.session?.access_token;
      if (!token) throw new Error("Please sign in to delete a listing.");
      const response = await fetch(`/api/trades?id=${listing.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to delete this listing.");
      setListings((current) =>
        current.filter((item) => item.id !== listing.id),
      );
      setMessage("Your listing was deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this listing.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const visibleListings = listings.filter((listing) =>
    `${listing.offeredCard} ${listing.desiredCard} ${listing.name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  if (checkingAccount) {
    return <main className="min-h-screen bg-[#050506]" />;
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-[#050506] px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-[2.25rem] border border-violet-400/30 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.42),transparent_40%),radial-gradient(circle_at_88%_58%,rgba(251,191,36,0.2),transparent_34%),rgba(255,255,255,0.035)] px-7 py-10 shadow-[0_28px_100px_rgba(76,29,149,0.34)] sm:px-12 sm:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-amber-300">PullShield protected trades</p>
                <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-7xl">Trade Pokémon cards without trusting a stranger.</h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">You make the trade. Both collectors send their cards to Pull Theory. We verify the cards and the trade before either card is sent to its new owner.</p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="text-center sm:text-left">
                    <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-7 py-4 text-base font-bold text-white shadow-[0_14px_40px_rgba(124,58,237,0.42)] transition hover:-translate-y-0.5 hover:bg-violet-500">JOIN-FREE + ENTER TO WIN</Link>
                    <p className="mt-2 text-xs font-semibold tracking-wide text-zinc-300">FREE account - No credit card required</p>
                  </div>
                  <a href="#how-it-works" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/[0.06] px-7 py-4 text-base font-semibold text-white transition hover:border-amber-300/60 hover:bg-white/10">See how protected trading works</a>
                </div>
                <p className="mt-6 text-sm text-zinc-400">Already have an account? <Link href="/login" className="font-semibold text-amber-300 transition hover:text-amber-200">Log in</Link></p>
              </div>
              <aside className="relative mx-auto w-full max-w-sm rounded-[2rem] border border-amber-200/55 bg-black/45 p-4 shadow-2xl backdrop-blur">
                <div className="absolute -inset-8 rounded-full bg-amber-300/20 blur-3xl" />
                <div className="relative overflow-hidden rounded-[1.5rem] border border-amber-200/55">
                  <img src="/pikachu-giveaway.jpeg" alt="PSA 10 Pikachu Illustration Contest 2024 slab giveaway" className="aspect-[3/4] w-full object-cover" />
                  <div className="absolute inset-x-3 top-3 rounded-xl bg-black/80 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-amber-200 backdrop-blur">🎁 Founding member giveaway</div>
                </div>
                <p className="relative mt-4 text-center text-lg font-bold text-white">One of our first 500 members will win this PSA 10 Pikachu.</p>
                <p className="relative mt-2 text-center text-sm font-bold text-emerald-300">Joining is FREE. No credit card required.</p>
                <p className="relative mt-2 text-center text-sm font-semibold text-violet-200">Sign up by 09/20/2026</p>
                <p className="relative mt-3 text-center text-xs leading-5 text-zinc-400">* We will pay for reholder and shipping through PSA.</p>
              </aside>
            </div>
          </section>

          <section id="how-it-works" className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-[0_20px_70px_rgba(0,0,0,0.22)] sm:p-10">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">The PullShield process</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">A safe trade has a neutral middle.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-300">No money changes hands for the cards. Pull Theory verifies the cards before they move to their new collectors.</p>
            </div>
            <div className="mx-auto mt-9 max-w-5xl">
              <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1.25fr_auto_1fr]">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Collector</p><p className="mt-2 text-xl font-bold text-white">YOU</p><p className="mt-2 text-sm text-zinc-400">Send your trade card</p></div>
                <div className="hidden text-3xl text-amber-300 md:block">→</div>
                <div className="rounded-3xl border border-violet-300/50 bg-violet-500/[0.14] p-6 text-center shadow-[0_0_45px_rgba(124,58,237,0.22)]"><div className="text-4xl">🛡️</div><p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Neutral verifier</p><p className="mt-2 text-2xl font-black text-white">PULL THEORY</p><p className="mt-2 text-sm text-zinc-200">We inspect both cards and confirm the trade.</p></div>
                <div className="hidden text-3xl text-amber-300 md:block">←</div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Collector</p><p className="mt-2 text-xl font-bold text-white">OTHER COLLECTOR</p><p className="mt-2 text-sm text-zinc-400">Sends their trade card</p></div>
              </div>
              <div className="mx-auto my-5 w-fit text-3xl text-amber-300">↓</div>
              <div className="mx-auto max-w-lg rounded-3xl border border-emerald-300/35 bg-emerald-400/[0.08] p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Inspection complete</p><p className="mt-2 text-2xl font-bold text-white">CARDS VERIFIED</p></div>
              <div className="mx-auto my-5 w-fit text-3xl text-amber-300">↓</div>
              <div className="mx-auto max-w-lg rounded-3xl border border-amber-300/35 bg-amber-300/[0.08] p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Protected return shipment</p><p className="mt-2 text-2xl font-bold text-white">CARDS SENT TO THEIR NEW OWNERS</p></div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-emerald-300/25 bg-emerald-400/[0.06] p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">What PullShield protects</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Clear answers before you trade.</h2>
              <div className="mt-7 space-y-5">
                <div><h3 className="font-bold text-white">What if a card does not pass verification?</h3><p className="mt-2 text-sm leading-6 text-zinc-300">The trade pauses. We do not forward a card that appears counterfeit, altered, materially different from its listing, or unsafe to handle. We document the issue and return each card to its original sender when the trade is cancelled, subject to the trade&apos;s shipping and service terms.</p></div>
                <div><h3 className="font-bold text-white">What if the other collector never sends their card?</h3><p className="mt-2 text-sm leading-6 text-zinc-300">No card is sent to the other collector. If the shipping deadline passes, the trade is cancelled and any card already received by Pull Theory is returned to its original sender after return shipping is arranged.</p></div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.06] p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Transparent trade rules</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">No surprises at the finish line.</h2>
              <div className="mt-7 space-y-5">
                <div><h3 className="font-bold text-white">Who pays shipping?</h3><p className="mt-2 text-sm leading-6 text-zinc-300">Each collector pays to ship their own card to Pull Theory. Return shipping, insurance, and signature service are paid by the collector chosen in the trade checkout or divided as the collectors agree. Card value is never charged as part of the trade.</p></div>
                <div><h3 className="font-bold text-white">How is condition determined?</h3><p className="mt-2 text-sm leading-6 text-zinc-300">We compare the received card with the listing and document visible condition details such as surface wear, corners, edges, centering, and defects. PullShield is a good-faith inspection, not a professional grading certificate or a guarantee of future value.</p></div>
              </div>
              <Link href="/terms" className="mt-7 inline-block text-sm font-bold text-amber-200 transition hover:text-white">Read the PullShield terms →</Link>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-violet-400/25 bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,0.25),transparent_38%),rgba(255,255,255,0.035)] p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">Built for the whole collection</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">Trade safely. Collect with clarity.</h2>
            <p className="mt-4 max-w-2xl text-zinc-300">PullShield protects the trade. The rest of Pull Theory helps collectors understand what they own and what comes next.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-3xl border border-white/10 bg-black/25 p-5"><p className="text-2xl">✦</p><h3 className="mt-4 text-lg font-bold text-white">TheoryScore</h3><p className="mt-2 text-sm leading-6 text-zinc-400">See rarity, demand, condition signals, and long-term potential in one collector-focused view.</p></article>
              <article className="rounded-3xl border border-white/10 bg-black/25 p-5"><p className="text-2xl">▣</p><h3 className="mt-4 text-lg font-bold text-white">Collection tracking</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Catalog every card, add photos, organize binders, and keep your collection in one place.</p></article>
              <article className="rounded-3xl border border-white/10 bg-black/25 p-5"><p className="text-2xl">◈</p><h3 className="mt-4 text-lg font-bold text-white">Portfolio value</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Watch your collection&apos;s market estimate grow as you add cards and understand your portfolio.</p></article>
              <article className="rounded-3xl border border-white/10 bg-black/25 p-5"><p className="text-2xl">✺</p><h3 className="mt-4 text-lg font-bold text-white">AI collector assistant</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Get collector-focused help researching cards, sets, trade ideas, and your next move.</p></article>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050506]/70 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-amber-300/45 bg-[radial-gradient(circle_at_75%_45%,rgba(251,191,36,0.24),transparent_38%),linear-gradient(120deg,rgba(124,58,237,0.42),rgba(12,10,18,0.96))] shadow-[0_24px_80px_rgba(124,58,237,0.28)]">
          <div className="grid items-center gap-6 p-5 sm:grid-cols-[1fr_auto] sm:p-8">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-200">🎁 Founding member giveaway</p>
              <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight text-white sm:text-5xl">One of our first 500 members will win this PSA 10 Pikachu.</h2>
              <p className="mt-3 text-base font-bold text-emerald-300 sm:text-lg">Joining is FREE. No credit card required.</p>
              <p className="mt-2 text-base font-semibold text-violet-100 sm:text-lg">Sign up by 09/20/2026.</p>
              <p className="mt-8 text-left text-xs leading-5 text-zinc-300">* We will pay for reholder and shipping through PSA.</p>
            </div>
            <div className="relative mx-auto w-full max-w-[15rem] sm:w-60 sm:max-w-none">
              <div className="absolute -inset-5 rounded-full bg-amber-300/25 blur-3xl" />
              <img src="/pikachu-giveaway.jpeg" alt="PSA graded Pikachu Illustration Contest 2024 slab giveaway" className="relative aspect-[3/4] w-full rounded-2xl border-2 border-amber-200/65 object-cover shadow-2xl" />
              <div className="absolute inset-x-3 top-3 rounded-xl bg-black/75 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-amber-200 backdrop-blur">Giveaway prize</div>
            </div>
          </div>
        </section>
        <section className="rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.26),transparent_45%),rgba(255,255,255,0.035)] p-8 sm:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Marketplace</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                Find the card you want. Make the trade safely.
              </h1>
              <p className="mt-4 max-w-2xl text-zinc-300">
                Offer cards from your collection, list your own trade inventory, and let PullShield protect the trade.
              </p>
            </div>
            <div className="flex flex-wrap gap-3"><Link href="/search" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/[0.06] px-5 py-3 font-semibold text-white transition hover:bg-white/10">🔍 Find a Card</Link><Link href="/matches" className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/40 bg-emerald-400/[0.1] px-5 py-3 font-semibold text-emerald-100 transition hover:bg-emerald-400/[0.18]">🔥 Your PullMatches</Link><Link href="/marketplace/list" className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white shadow-[0_12px_35px_rgba(124,58,237,0.35)] transition hover:bg-violet-500">＋ List a Card for Trade</Link></div>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cards, collectors, or trade requests"
            className="mt-8 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none placeholder:text-zinc-600 focus:border-violet-400"
          />
        </section>

        <div className="mt-10 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
              Active listings
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Cards collectors want to trade
            </h2>
          </div>
          <button
            onClick={loadListings}
            className="text-sm font-semibold text-violet-300 hover:text-violet-200"
          >
            Refresh listings
          </button>
        </div>
        {message && (
          <p className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">
            {message}
          </p>
        )}
        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loading ? (
            <p className="text-zinc-400">Loading trade listings...</p>
          ) : visibleListings.length ? (
            visibleListings.map((listing) => {
              const ownListing = userId && listing.user_id === userId;
              return (
                <article
                  key={listing.id}
                  className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:border-violet-400/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Available
                    </span>
                    <span className="text-xs text-zinc-500">
                      Listing #{listing.id}
                    </span>
                  </div>
                  {listing.photoUrls?.[0] && (
                    <img
                      src={listing.photoUrls[0]}
                      alt={`Front of ${listing.offeredCard}`}
                      className="mt-5 aspect-[2.5/3.5] w-full rounded-2xl border border-white/10 bg-black/25 object-contain"
                    />
                  )}
                  <h3 className="mt-6 text-xl font-semibold">
                    {listing.offeredCard}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Listed by {listing.name}
                  </p>
                  {listing.traderBadge && (
                    <span
                      title={listing.traderBadge.description}
                      className={`mt-3 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${listing.traderBadge.color}`}
                    >
                      ✓ {listing.traderBadge.label} ·{" "}
                      {listing.traderBadge.verifiedTrades} verified
                    </span>
                  )}
                  <div className="mt-5 rounded-2xl bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      They want
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {listing.desiredCard || "Open to offers"}
                    </p>
                  </div>
                  {listing.notes && (
                    <p className="mt-4 text-sm leading-6 text-zinc-400">
                      {listing.notes}
                    </p>
                  )}
                  {ownListing ? (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Link
                        href={`/marketplace/${listing.id}`}
                        className="rounded-2xl border border-violet-400/40 px-4 py-3 text-center text-sm font-semibold text-violet-200 transition hover:bg-violet-500/15"
                      >
                        View
                      </Link>
                      <button
                        disabled={deletingId === listing.id}
                        onClick={() => void deleteListing(listing)}
                        className="rounded-2xl border border-rose-400/45 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:opacity-50"
                      >
                        {deletingId === listing.id
                          ? "Deleting..."
                          : "Delete listing"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelected(listing)}
                      className="mt-6 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500"
                    >
                      Make a trade offer
                    </button>
                  )}
                </article>
              );
            })
          ) : (
            <p className="rounded-3xl border border-dashed border-white/15 p-8 text-zinc-400">
              No listings match your search yet.
            </p>
          )}
        </section>
      </div>
      {selected && (
        <OfferModal
          listing={selected}
          onClose={() => setSelected(null)}
          onSubmitted={() => {
            setSelected(null);
            loadListings();
          }}
        />
      )}
    </main>
  );
}

export function PublicLanding() {
  return (
    <main className="min-h-screen bg-[#050506] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-violet-400/30 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.42),transparent_40%),radial-gradient(circle_at_88%_58%,rgba(251,191,36,0.2),transparent_34%),rgba(255,255,255,0.035)] px-7 py-10 shadow-[0_28px_100px_rgba(76,29,149,0.34)] sm:px-12 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative z-10"><p className="text-sm font-bold uppercase tracking-[0.26em] text-amber-300">PullShield protected trades</p><h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-7xl">Trade Pokémon cards without trusting a stranger.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">You make the trade. Both collectors send their cards to Pull Theory. We verify the cards and the trade before either card is sent to its new owner.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-start"><div className="text-center sm:text-left"><Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-7 py-4 text-base font-bold text-white shadow-[0_14px_40px_rgba(124,58,237,0.42)] transition hover:-translate-y-0.5 hover:bg-violet-500">JOIN-FREE + ENTER TO WIN</Link><p className="mt-2 text-xs font-semibold tracking-wide text-zinc-300">FREE account - No credit card required</p></div><a href="#how-it-works" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/[0.06] px-7 py-4 text-base font-semibold text-white transition hover:border-amber-300/60 hover:bg-white/10">See how protected trading works</a></div><p className="mt-6 text-sm text-zinc-400">Already have an account? <Link href="/login" className="font-semibold text-amber-300 transition hover:text-amber-200">Log in</Link></p></div>
            <aside className="relative mx-auto w-full max-w-sm rounded-[2rem] border border-amber-200/55 bg-black/45 p-4 shadow-2xl backdrop-blur"><div className="absolute -inset-8 rounded-full bg-amber-300/20 blur-3xl" /><div className="relative overflow-hidden rounded-[1.5rem] border border-amber-200/55"><img src="/pikachu-giveaway.jpeg" alt="PSA 10 Pikachu Illustration Contest 2024 slab giveaway" className="aspect-[3/4] w-full object-cover" /><div className="absolute inset-x-3 top-3 rounded-xl bg-black/80 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-amber-200 backdrop-blur">🎁 Founding member giveaway</div></div><p className="relative mt-4 text-center text-lg font-bold text-white">One of our first 500 members will win this PSA 10 Pikachu.</p><p className="relative mt-2 text-center text-sm font-bold text-emerald-300">Joining is FREE. No credit card required.</p><p className="relative mt-2 text-center text-sm font-semibold text-violet-200">Sign up by 09/20/2026</p><p className="relative mt-3 text-center text-xs leading-5 text-zinc-400">* We will pay for reholder and shipping through PSA.</p></aside>
          </div>
        </section>
        <section id="how-it-works" className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-[0_20px_70px_rgba(0,0,0,0.22)] sm:p-10"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">The PullShield process</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">A safe trade has a neutral middle.</h2><p className="mx-auto mt-4 max-w-2xl text-zinc-300">No money changes hands for the cards. Pull Theory verifies the cards before they move to their new collectors.</p></div><div className="mx-auto mt-9 max-w-5xl"><div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1.25fr_auto_1fr]"><div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Collector</p><p className="mt-2 text-xl font-bold text-white">YOU</p><p className="mt-2 text-sm text-zinc-400">Send your trade card</p></div><div className="hidden text-3xl text-amber-300 md:block">→</div><div className="rounded-3xl border border-violet-300/50 bg-violet-500/[0.14] p-6 text-center shadow-[0_0_45px_rgba(124,58,237,0.22)]"><div className="text-4xl">🛡️</div><p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Neutral verifier</p><p className="mt-2 text-2xl font-black text-white">PULL THEORY</p><p className="mt-2 text-sm text-zinc-200">We inspect both cards and confirm the trade.</p></div><div className="hidden text-3xl text-amber-300 md:block">←</div><div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Collector</p><p className="mt-2 text-xl font-bold text-white">OTHER COLLECTOR</p><p className="mt-2 text-sm text-zinc-400">Sends their trade card</p></div></div><div className="mx-auto my-5 w-fit text-3xl text-amber-300">↓</div><div className="mx-auto max-w-lg rounded-3xl border border-emerald-300/35 bg-emerald-400/[0.08] p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Inspection complete</p><p className="mt-2 text-2xl font-bold text-white">CARDS VERIFIED</p></div><div className="mx-auto my-5 w-fit text-3xl text-amber-300">↓</div><div className="mx-auto max-w-lg rounded-3xl border border-amber-300/35 bg-amber-300/[0.08] p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Protected return shipment</p><p className="mt-2 text-2xl font-bold text-white">CARDS SENT TO THEIR NEW OWNERS</p></div></div></section>
        <section className="mt-8 grid gap-4 md:grid-cols-2"><article className="rounded-3xl border border-emerald-300/25 bg-emerald-400/[0.06] p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">If a card fails verification</p><h2 className="mt-3 text-2xl font-bold text-white">The trade stops.</h2><p className="mt-3 text-sm leading-6 text-zinc-300">We do not forward a card that appears counterfeit, altered, or materially different from its listing. We document the issue and return cards to their original senders under the trade&apos;s shipping and service terms.</p></article><article className="rounded-3xl border border-amber-300/25 bg-amber-300/[0.06] p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">If a collector does not ship</p><h2 className="mt-3 text-2xl font-bold text-white">The trade is cancelled.</h2><p className="mt-3 text-sm leading-6 text-zinc-300">No card is sent to the other collector. Any card already received by Pull Theory is returned to its original sender after return shipping is arranged.</p></article></section>
        <section className="mt-8 rounded-[2rem] border border-violet-400/25 bg-white/[0.035] p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">More than a trade marketplace</p><h2 className="mt-3 text-3xl font-bold text-white sm:text-5xl">Tools for serious collectors.</h2><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["TheoryScore", "Understand rarity, demand, condition signals, and long-term potential."], ["Collection tracking", "Catalog cards, organize binders, and add card photos."], ["Portfolio value", "Watch your collection&apos;s market estimate grow."], ["AI collector assistant", "Get collector-focused help with cards, sets, and trades."]].map(([title, description]) => <article key={title} className="rounded-3xl border border-white/10 bg-black/25 p-5"><h3 className="font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></article>)}</div></section>
      </div>
    </main>
  );
}
