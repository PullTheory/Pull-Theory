"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OfferModal from "../../components/OfferModal";
import { getSupabaseClient } from "../../lib/supabase";
import { decodeCardDetails } from "../../lib/cardDetails";
import BuyNowButton from "../../components/BuyNowButton";

type Listing = {
  id: number;
  name: string;
  offeredCard: string;
  desiredCard: string;
  notes?: string;
  user_id?: string | null;
  photoUrls?: string[];
  listingType?: "trade" | "sell" | "trade_or_sell";
  salePriceCents?: number | null;
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
  const [selected, setSelected] = useState<Listing | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadListings() {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/trades?is_listing=true&pageSize=100",
      );
      const data = await response.json();

      setListings(response.ok ? data.items ?? [] : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadListings();

    const supabase = getSupabaseClient();

    void supabase?.auth
      .getSession()
      .then(({ data }: any) => setUserId(data.session?.user.id ?? null));
  }, []);

  function startOffer(listing: Listing) {
    if (!userId) {
      window.location.assign(
        `/signup?returnTo=${encodeURIComponent(
          `/marketplace/${listing.id}`,
        )}`,
      );
      return;
    }

    setSelected(listing);
  }

  async function deleteListing(listing: Listing) {
    if (
      !window.confirm(
        `Remove your listing for ${listing.offeredCard} from the marketplace? Your card will stay in your portfolio, and pending offers will be cancelled.`,
      )
    ) {
      return;
    }

    setDeletingId(listing.id);
    setMessage("");

    try {
      const supabase = getSupabaseClient();

      const { data } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };

      const token = data.session?.access_token;

      if (!token) {
        throw new Error("Please sign in to delete a listing.");
      }

      const response = await fetch(`/api/trades?id=${listing.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete this listing.");
      }

      setListings((current) =>
        current.filter((item) => item.id !== listing.id),
      );

      setMessage(
        "Your card was removed from the marketplace. It is still in your portfolio.",
      );
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

  const search = query.trim().toLowerCase();

  const visibleListings = listings.filter((listing) =>
    `${listing.offeredCard} ${listing.desiredCard} ${listing.name} ${
      listing.notes ?? ""
    }`
      .toLowerCase()
      .includes(search),
  );

  return (
    <main className="min-h-screen bg-[#050506]/70 px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {!userId && (
          <section className="mb-6 flex flex-col gap-4 rounded-3xl border border-violet-400/30 bg-violet-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-white">
                Browse every available card — no account required.
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                Create a free account when you are ready to buy, sell, trade,
                make an offer, or post a card.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold"
              >
                Sign up free
              </Link>
            </div>
          </section>
        )}

        {userId && (
          <section className="mb-6 flex flex-col gap-3 rounded-3xl border border-amber-300/25 bg-amber-300/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-amber-100">
                🎁 Founding member giveaway: win the PSA 10 Pikachu
              </p>

              <p className="mt-1 text-xs text-zinc-300">
                Free entry for the first 500 members · Sign up by 09/20/2026
              </p>
            </div>

            <Link
              href="/"
              className="text-sm font-semibold text-amber-200"
            >
              Giveaway details →
            </Link>
          </section>
        )}

        <section className="rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.26),transparent_45%),rgba(255,255,255,0.035)] p-7 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
                Marketplace
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                Buy, Sell, or Trade with confidence.
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-300">
                Browse cards to buy, sell, or trade. PullShield protects each
                transaction by verifying cards before they reach their new
                collectors.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/search"
                className="rounded-2xl border border-white/20 bg-white/[0.06] px-5 py-3 font-semibold"
              >
                🔍 Find a Card
              </Link>

              {userId && (
                <Link
                  href="/matches"
                  className="rounded-2xl border border-emerald-300/40 bg-emerald-400/[0.1] px-5 py-3 font-semibold text-emerald-100"
                >
                  🔥 PullMatches
                </Link>
              )}

              <Link
                href={userId ? "/marketplace/list" : "/signup"}
                className="rounded-2xl bg-violet-600 px-5 py-3 font-bold"
              >
                ＋ List a Card
              </Link>
            </div>
          </div>

          <label className="mt-8 block">
            <span className="sr-only">
              Search marketplace listings
            </span>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cards, sets, collectors, or wanted cards"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none placeholder:text-zinc-600 focus:border-violet-400"
            />
          </label>
        </section>

        <div className="mt-9 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
              Active listings
            </p>

            <h2 className="mt-2 text-3xl font-semibold">
              Cards available to buy, sell, or trade
            </h2>
          </div>

          <button
            onClick={() => void loadListings()}
            className="text-sm font-semibold text-violet-300"
          >
            Refresh
          </button>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">
            {message}
          </p>
        )}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <p className="col-span-full text-zinc-400">
              Loading marketplace listings...
            </p>
          ) : visibleListings.length ? (
            visibleListings.map((listing) => {
              const ownListing = Boolean(
                userId && listing.user_id === userId,
              );

              const details = decodeCardDetails(listing.notes);

              const canBuy =
                (listing.listingType === "sell" ||
                  listing.listingType === "trade_or_sell") &&
                Boolean(listing.salePriceCents);

              const canTrade = listing.listingType !== "sell";

              return (
                <article
                  key={listing.id}
                  className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:border-violet-400/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {listing.listingType === "sell"
                        ? "For sale"
                        : listing.listingType === "trade_or_sell"
                          ? "Trade or sell"
                          : "Available for trade"}
                    </span>

                    <span className="text-xs text-zinc-500">
                      #{listing.id}
                    </span>
                  </div>

                  {listing.photoUrls?.[0] && (
                    <img
                      src={listing.photoUrls[0]}
                      alt={`Front of ${listing.offeredCard}`}
                      className="mt-5 aspect-[2.5/3.5] w-full rounded-2xl border border-white/10 bg-black/25 object-contain"
                    />
                  )}

                  <h3 className="mt-5 text-xl font-semibold">
                    {listing.offeredCard}
                  </h3>

                  {canBuy && (
                    <p className="mt-2 text-lg font-bold text-emerald-200">
                      {(listing.salePriceCents! / 100).toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        },
                      )}
                    </p>
                  )}

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

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {details.condition && (
                      <Detail
                        label="Condition"
                        value={details.condition}
                      />
                    )}

                    {details.grade && (
                      <Detail
                        label="Grade"
                        value={`${details.gradingCompany || ""} ${
                          details.grade
                        }`.trim()}
                      />
                    )}

                    {details.estimatedValue && (
                      <Detail
                        label="Est. value"
                        value={details.estimatedValue}
                      />
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Looking for
                    </p>

                    <p className="mt-1 text-sm text-zinc-200">
                      {listing.desiredCard || "Open to offers"}
                    </p>
                  </div>

                  <div className="mt-auto pt-5">
                    {ownListing ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={`/marketplace/${listing.id}/edit`}
                          className="rounded-2xl border border-violet-400/40 px-4 py-3 text-center text-sm font-semibold text-violet-200"
                        >
                          Manage
                        </Link>

                        <button
                          disabled={deletingId === listing.id}
                          onClick={() => void deleteListing(listing)}
                          className="rounded-2xl border border-rose-400/45 px-4 py-3 text-sm font-semibold text-rose-200 disabled:opacity-50"
                        >
                          {deletingId === listing.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <Link
                          href={`/marketplace/${listing.id}`}
                          className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold"
                        >
                          View details
                        </Link>

                        {canTrade && (
                          <button
                            onClick={() => startOffer(listing)}
                            className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold"
                          >
                            {userId
                              ? "Offer trade"
                              : "Sign up to offer"}
                          </button>
                        )}

                        {canBuy && (
                          <BuyNowButton
                            listingId={listing.id}
                            priceCents={listing.salePriceCents!}
                            className="w-full"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-white/15 p-10 text-center">
              <p className="text-lg font-semibold text-white">
                No listings match “{query.trim()}” yet.
              </p>

              <p className="mt-2 text-zinc-400">
                Try another search or list the card you want to buy, sell,
                or trade.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={userId ? "/marketplace/list" : "/signup"}
                  className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold"
                >
                  List this card
                </Link>

                <Link
                  href="/search"
                  className="rounded-2xl border border-white/15 px-5 py-3 font-semibold"
                >
                  Search the card database
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <OfferModal
          listing={selected}
          onClose={() => setSelected(null)}
          onSubmitted={() => {
            setSelected(null);
            void loadListings();
          }}
        />
      )}
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/25 p-3">
      <p className="uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-zinc-200">
        {value}
      </p>
    </div>
  );
}

export function PublicLanding() {
  return (
    <main className="min-h-screen bg-[#050506] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-violet-400/30 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.42),transparent_40%),radial-gradient(circle_at_88%_58%,rgba(251,191,36,0.2),transparent_34%),rgba(255,255,255,0.035)] px-7 py-10 shadow-[0_28px_100px_rgba(76,29,149,0.34)] sm:px-12 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-amber-300">
                PullShield protected marketplace
              </p>

              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl">
                Buy, sell, or trade Pokémon cards without trusting a
                stranger.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">
                Pull Theory sits in the middle. Cards are sent to us for
                verification before a protected sale or trade is completed.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/marketplace/browse"
                  className="rounded-2xl border border-white/20 bg-white/[0.06] px-7 py-4 font-bold"
                >
                  Browse cards first
                </Link>

                <Link
                  href="/signup"
                  className="rounded-2xl bg-violet-600 px-7 py-4 font-bold shadow-[0_14px_40px_rgba(124,58,237,0.42)]"
                >
                  Join free + enter to win
                </Link>
              </div>

              <p className="mt-4 text-sm text-zinc-400">
                No credit card required
              </p>
            </div>

            <aside className="mx-auto w-full max-w-xs rounded-[2rem] border border-amber-200/55 bg-black/45 p-4">
              <img
                src="/pikachu-giveaway.jpeg"
                alt="PSA 10 Pikachu giveaway"
                className="aspect-[3/4] w-full rounded-[1.5rem] object-cover"
              />

              <p className="mt-4 text-center font-bold">
                One of our first 500 members will win this PSA 10 Pikachu.
              </p>

              <p className="mt-2 text-center text-sm text-amber-200">
                Sign up by 09/20/2026
              </p>
            </aside>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
            The PullShield process
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-5xl">
            A protected transaction has a neutral middle.
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              [
                "01",
                "Buy, sell, or trade",
                "Collectors agree on the transaction.",
              ],
              [
                "02",
                "Ship to Pull Theory",
                "The card comes to the neutral middle.",
              ],
              [
                "03",
                "We verify",
                "The card is checked against its listing.",
              ],
              [
                "04",
                "Complete the transaction",
                "Verified cards move to their new collector.",
              ],
            ].map(([step, title, text]) => (
              <article
                key={step}
                className="rounded-3xl border border-white/10 bg-black/25 p-5 text-left"
              >
                <p className="text-amber-300">{step}</p>

                <h3 className="mt-3 font-bold">{title}</h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-emerald-300/25 bg-emerald-400/[0.06] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              If a card fails verification
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              The transaction stops.
            </h2>

            <p className="mt-3 text-zinc-300">
              We document the issue and do not forward a counterfeit,
              altered, or materially different card.
            </p>
          </article>

          <article className="rounded-3xl border border-amber-300/25 bg-amber-300/[0.06] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-200">
              PullShield protection
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Buyers and traders stay protected.
            </h2>

            <p className="mt-3 text-zinc-300">
              Sales and trades are not completed until the required card
              verification step is finished.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
