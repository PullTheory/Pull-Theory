import { NextResponse } from "next/server";
import { getTrades, getUserFromToken } from "../../lib/tradesStore";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Please sign in to view your offers." }, { status: 401 });

    const ownListings = await getTrades({ user_id: user.id, is_listing: true, page: 1, pageSize: 1000 });
    const listingIds = new Set(ownListings.items.map((listing) => listing.id));
    const allTrades = await getTrades({ page: 1, pageSize: 1000 });
    const offers = allTrades.items
      .filter(
        (trade) =>
          trade.listing_id &&
          listingIds.has(trade.listing_id) &&
          String(trade.user_id) !== String(user.id)
      )
      .map(({ email, shippingAddress, acceptedBy, authenticatorAddress, ...offer }) => {
        const listing = ownListings.items.find((item) => item.id === offer.listing_id);
        return {
          ...offer,
          pullshieldShippingAddress: authenticatorAddress ?? null,
          addressTradeId: listing?.id ?? null,
          needsReturnAddress: !listing?.shippingAddress || listing.shippingAddress === "COLLECT_AFTER_ACCEPTANCE",
        };
      });

    const acceptedOffers = allTrades.items
      .filter(
        (trade) =>
          !trade.is_listing &&
          trade.listing_id &&
          trade.status !== 'pending' &&
          (String(trade.user_id) === String(user.id) || listingIds.has(trade.listing_id))
      )
      .map(({ email, shippingAddress, acceptedBy, authenticatorAddress, ...offer }) => {
        const ownRecord = String(offer.user_id) === String(user.id)
          ? { id: offer.id, shippingAddress }
          : ownListings.items.find((item) => item.id === offer.listing_id);
        return {
          ...offer,
          pullshieldShippingAddress: authenticatorAddress ?? null,
          addressTradeId: ownRecord?.id ?? null,
          needsReturnAddress: !ownRecord?.shippingAddress || ownRecord.shippingAddress === "COLLECT_AFTER_ACCEPTANCE",
        };
      });

    return NextResponse.json({
      offers,
      acceptedOffers,
      listings: ownListings.items.map(({ email, shippingAddress, acceptedBy, authenticatorAddress, ...listing }) => listing),
    });
  } catch (error) {
    console.error("[api/offers] unable to load offers", error);
    return NextResponse.json({ error: "Unable to load your offers." }, { status: 500 });
  }
}
