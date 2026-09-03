import { NextResponse } from "next/server";
import { getTrade, getTrades, getUserFromToken, updateShipmentStatus } from "../../lib/tradesStore";
import { sendNotification } from "../../lib/notifications";
import { getLifecycleSummary, getSignupSummary, getTrafficSummary } from "../../lib/trafficStore";
import { isPullTheoryOperator } from "../../lib/operator";

const allowedStatuses = ["awaiting_shipment", "received", "authenticated", "return_shipped", "completed", "cancelled"] as const;
type ShipmentStatus = (typeof allowedStatuses)[number];

async function operatorFor(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  const user = await getUserFromToken(token);
  return user && isPullTheoryOperator(user.email) ? user : null;
}

// The navigation uses this lightweight check so the staff-only desk link is
// never shown to regular collectors. The GET and POST routes remain protected
// separately, so typing the URL directly cannot grant access.
export async function HEAD(request: Request) {
  const operator = await operatorFor(request);
  return new NextResponse(null, { status: operator ? 204 : 403 });
}

export async function GET(request: Request) {
  try {
    const operator = await operatorFor(request);
    if (!operator) return NextResponse.json({ error: "PullShield Desk is only available to the designated operator account." }, { status: 403 });

    const allTrades = await getTrades({ page: 1, pageSize: 1000 });
    const listingById = new Map(allTrades.items.filter((trade) => trade.is_listing).map((trade) => [trade.id, trade]));
    const shipments = allTrades.items
      .filter((trade) => !trade.is_listing && trade.listing_id && trade.status !== "pending")
      .map((offer) => ({ offer, listing: listingById.get(offer.listing_id!) }))
      .filter((shipment) => shipment.listing);

    const trafficResult = await Promise.allSettled([getTrafficSummary(), getSignupSummary(), getLifecycleSummary()]);
    const traffic = trafficResult[0].status === "fulfilled" ? trafficResult[0].value : null;
    const signups = trafficResult[1].status === "fulfilled" ? trafficResult[1].value : null;
    const lifecycle = trafficResult[2].status === "fulfilled" ? trafficResult[2].value : null;
    return NextResponse.json({ shipments, traffic, signups, lifecycle });
  } catch (error) {
    console.error("[api/pullshield] unable to load shipments", error);
    return NextResponse.json({ error: "Unable to load PullShield shipments." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const operator = await operatorFor(request);
    if (!operator) return NextResponse.json({ error: "PullShield Desk is only available to the designated operator account." }, { status: 403 });
    const body = await request.json();
    const offerId = Number(body?.offerId);
    const status = body?.status as ShipmentStatus;
    if (!Number.isInteger(offerId) || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "A valid shipment and status are required." }, { status: 400 });
    }

    const existingOffer = await getTrade(offerId);
    if (!existingOffer?.listing_id) return NextResponse.json({ error: "Shipment not found." }, { status: 404 });
    const existingListing = await getTrade(existingOffer.listing_id);
    if (!existingListing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

    const cancellationReason = status === "cancelled" ? String(body?.reason ?? "").trim() : undefined;
    if (status === "cancelled" && !cancellationReason) return NextResponse.json({ error: "A cancellation reason is required." }, { status: 400 });
    const shipment = await updateShipmentStatus(offerId, status, cancellationReason);
    if (!shipment) return NextResponse.json({ error: "Shipment could not be updated." }, { status: 404 });

    const messages: Record<ShipmentStatus, string> = {
      awaiting_shipment: "Your trade was accepted. Please send your card to PullShield using the address in your accepted-trade instructions.",
      received: "PullShield has received the card(s) for your trade.",
      authenticated: "PullShield authentication is complete. Your verified trade is being prepared for return shipment.",
      return_shipped: "Your authenticated trade has shipped back to you.",
      completed: "Your PullShield trade is complete. Both cards have been shipped back to their new owners.",
      cancelled: `Your PullShield trade was cancelled. Reason: ${cancellationReason}. You will receive a follow-up explanation within 48 hours if more information is needed.`,
    };
    await Promise.allSettled([
      existingOffer.email ? sendNotification(existingOffer.email, "PullShield trade update", messages[status]) : Promise.resolve(false),
      existingListing.email ? sendNotification(existingListing.email, "PullShield trade update", messages[status]) : Promise.resolve(false),
    ]);

    return NextResponse.json({ shipment });
  } catch (error) {
    console.error("[api/pullshield] unable to update shipment", error);
    return NextResponse.json({ error: "Unable to update the shipment." }, { status: 500 });
  }
}
