import { NextResponse } from "next/server";
import { addTrade, counterOffer, deleteListing, getTrade, getTrades, getUserFromToken, updateShippingAddress } from "../../lib/tradesStore";
import { getTraderBadge } from "../../lib/traderBadges";
import { recordLifecycleEvent } from "../../lib/trafficStore";
import { notifyMembersOfNewListing } from "../../lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Please sign in to create a listing or offer." }, { status: 401 });
    }

    const requestedName = String(body?.name ?? "").trim();
    const profileName = typeof user.user_metadata?.username === "string" ? user.user_metadata.username.trim() : "";
    const name = profileName || requestedName;
    const offeredCard = String(body?.offeredCard ?? "").trim();
    let desiredCard = String(body?.desiredCard ?? "Open to offers").trim();
    const shippingAddress = String(body?.shippingAddress ?? "").trim() || "COLLECT_AFTER_ACCEPTANCE";
    const photoUrls = Array.isArray(body?.photoUrls)
      ? body.photoUrls.filter((url: unknown): url is string => typeof url === "string" && /^https?:\/\//.test(url)).slice(0, 6)
      : [];
    const isListing = Boolean(body?.is_listing);
    const listingType = body?.listingType === "sell" || body?.listingType === "trade_or_sell" ? body.listingType : "trade";
    const salePriceCents = body?.salePriceCents === null || body?.salePriceCents === undefined || body?.salePriceCents === ""
      ? null
      : Number(body.salePriceCents);
    const suppliedListingId = body?.listing_id;
    const listingId = suppliedListingId === undefined || suppliedListingId === null || suppliedListingId === ""
      ? null
      : Number(suppliedListingId);

    if (!name || !offeredCard || body?.agree !== true) {
      return NextResponse.json(
        { error: "Name, card, and agreement are required." },
        { status: 400 }
      );
    }

    if (isListing && photoUrls.length < 2) {
      return NextResponse.json({ error: "Please add a front and back photo of your card before listing it." }, { status: 400 });
    }

    if (isListing && listingType !== "trade" && (typeof salePriceCents !== "number" || !Number.isInteger(salePriceCents) || salePriceCents < 100)) {
      return NextResponse.json({ error: "Enter a sale price of at least $1.00 for a listing that can be purchased." }, { status: 400 });
    }

    if (!isListing && listingId !== null && photoUrls.length < 4) {
      return NextResponse.json({ error: "At least 4 card photos are required for trade offers." }, { status: 400 });
    }

    // An offer must belong to a real marketplace listing. The server, rather
    // than the browser, confirms who owns that listing and who sent the offer.
    if (listingId !== null) {
      if (!Number.isInteger(listingId) || listingId <= 0) {
        return NextResponse.json({ error: "That marketplace listing is invalid." }, { status: 400 });
      }

      const listing = await getTrade(listingId);
      if (!listing || !listing.is_listing || (listing.status && listing.status !== "pending")) {
        return NextResponse.json({ error: "That marketplace listing is no longer available." }, { status: 404 });
      }

      if (String(listing.user_id) === String(user.id)) {
        return NextResponse.json({ error: "You cannot submit an offer on your own listing." }, { status: 400 });
      }

      // Keep the offer attached to the exact card that was selected, even if
      // someone changes form data in their browser.
      desiredCard = listing.offeredCard;
    }

    const trade = await addTrade({
      name,
      email: user.email ?? "",
      user_id: user.id,
      offeredCard,
      desiredCard,
      shippingAddress,
      notes: body?.notes ? String(body.notes) : undefined,
      agree: true,
      is_listing: isListing,
      listing_id: listingId,
      photoUrls,
      listingType: isListing ? listingType : "trade",
      salePriceCents: isListing ? salePriceCents : null,
      currency: "usd",
    });
    await recordLifecycleEvent(user.id, isListing ? "first_tradeable_card" : "first_offer");
    if (isListing) {
      try {
        await notifyMembersOfNewListing({ listingId: trade.id, offeredCard: trade.offeredCard, desiredCard: trade.desiredCard, ownerUserId: user.id });
      } catch (notificationError) {
        console.error("[api/trades] listing notification failed", notificationError);
      }
    }

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error("[api/trades] unable to create trade", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create the trade." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Please sign in to save your return address." }, { status: 401 });
    const body = await request.json();
    const tradeId = Number(body?.tradeId);
    const shippingAddress = String(body?.shippingAddress ?? "").trim();
    if (!Number.isInteger(tradeId) || tradeId <= 0 || shippingAddress.length < 10) {
      return NextResponse.json({ error: "A complete return address is required." }, { status: 400 });
    }
    const trade = await updateShippingAddress(tradeId, user.id, shippingAddress);
    if (!trade) return NextResponse.json({ error: "Trade not found or unauthorized." }, { status: 404 });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("[api/trades] unable to save return address", error);
    return NextResponse.json({ error: "Unable to save your return address." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isListing = url.searchParams.get("is_listing");
    const userId = url.searchParams.get("user_id");
    const result = await getTrades({
      page: Number(url.searchParams.get("page") ?? "1"),
      pageSize: Number(url.searchParams.get("pageSize") ?? "50"),
      user_id: userId || null,
      is_listing: isListing === null ? null : isListing === "true",
      listing_id: url.searchParams.get("listing_id") ? Number(url.searchParams.get("listing_id")) : null,
      search: url.searchParams.get("search"),
    });

    // Only trades completed and marked verified by the authenticator earn reputation.
    const allTrades = await getTrades({ page: 1, pageSize: 1000 });
    const verifiedTradeCounts = new Map<string, number>();
    for (const trade of allTrades.items) {
      if (trade.status === "verified" && trade.user_id) {
        const id = String(trade.user_id);
        verifiedTradeCounts.set(id, (verifiedTradeCounts.get(id) ?? 0) + 1);
      }
    }

    // Marketplace endpoints request listings. Once a listing has an accepted
    // offer it moves out of the public marketplace immediately.
    const availableItems = isListing === "true"
      ? result.items.filter((trade) => trade.status === "pending" || !trade.status)
      : result.items;

    const items = availableItems.map(({ shippingAddress, email, ...trade }) => ({
      ...trade,
      traderBadge: getTraderBadge(verifiedTradeCounts.get(String(trade.user_id)) ?? 0),
    }));
    return NextResponse.json({
      ...result,
      items,
      total: items.length,
      traderBadge: userId ? getTraderBadge(verifiedTradeCounts.get(userId) ?? 0) : null,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load listings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Please sign in to counter an offer." }, { status: 401 });
    const body = await request.json();
    const offerId = Number(body?.offerId);
    const counterTerms = String(body?.counterTerms ?? "").trim();
    if (!Number.isInteger(offerId) || offerId <= 0 || !counterTerms) {
      return NextResponse.json({ error: "A counter offer is required." }, { status: 400 });
    }
    const offer = await counterOffer(offerId, user.id, counterTerms);
    if (!offer) return NextResponse.json({ error: "That offer can no longer be countered." }, { status: 404 });
    return NextResponse.json({ offer });
  } catch (error) {
    console.error("[api/trades] unable to counter offer", error);
    return NextResponse.json({ error: "Unable to send the counter offer." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Please sign in to delete a listing." }, { status: 401 });

    const listingId = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(listingId) || listingId <= 0) {
      return NextResponse.json({ error: "A valid listing is required." }, { status: 400 });
    }

    const result = await deleteListing(listingId, user.id);
    if (!result.deleted) return NextResponse.json({ error: result.error ?? "Unable to delete this listing." }, { status: 400 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[api/trades] unable to delete listing", error);
    return NextResponse.json({ error: "Unable to delete this listing." }, { status: 500 });
  }
}
