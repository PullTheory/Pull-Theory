import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripe";
import { getSaleOrder, getSellerAccount, SALE_ORDER_STATUSES, updateSaleOrder } from "../../../../lib/salesStore";
import { getUserFromToken } from "../../../../lib/tradesStore";
import { isPullTheoryOperator } from "../../../../lib/operator";

type Context = { params: Promise<{ id: string }> };

export const REQUIRED_AUTHENTICATION_CHECKS = [
  "card_identity", "print_quality", "magnification", "card_construction",
  "holo_texture", "light_uv", "genuine_comparison", "front_photo", "back_photo",
] as const;

export async function POST(request: Request, { params }: Context) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const user = await getUserFromToken(authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
    if (!user || !isPullTheoryOperator(user.email)) return NextResponse.json({ error: "Only the PullShield operator can update sale orders." }, { status: 403 });
    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await request.json();
    const status = body?.status as string;
    if (!Number.isInteger(id) || !SALE_ORDER_STATUSES.includes(status as never)) return NextResponse.json({ error: "A valid sale order and status are required." }, { status: 400 });
    const order = await getSaleOrder(id);
    if (!order) return NextResponse.json({ error: "Sale order not found." }, { status: 404 });

    const tracking = String(body?.trackingNumber ?? "").trim() || null;
    const reason = String(body?.reason ?? "").trim() || null;
    const submittedChecklist = body?.authenticationChecklist && typeof body.authenticationChecklist === "object" ? body.authenticationChecklist : order.authenticationChecklist;
    const submittedEvidence = Array.isArray(body?.authenticationEvidenceUrls) ? body.authenticationEvidenceUrls.filter((url: unknown) => typeof url === "string" && url.trim()).slice(0, 12) : order.authenticationEvidenceUrls;
    const submittedNotes = typeof body?.authenticationNotes === "string" ? body.authenticationNotes.trim().slice(0, 4000) : order.authenticationNotes;
    const updates: Record<string, unknown> = { order_status: status };

    if (body?.authenticationChecklist) updates.authentication_checklist = submittedChecklist;
    if (Array.isArray(body?.authenticationEvidenceUrls)) updates.authentication_evidence_urls = submittedEvidence;
    if (typeof body?.authenticationNotes === "string") updates.authentication_notes = submittedNotes || null;
    if (status === "payment_received") updates.payment_status = "paid";
    if (status === "received_by_pulltheory") updates.authentication_status = "received";
    if (status === "authentication_in_progress") updates.authentication_status = "in_progress";
    if (status === "authentication_failed") updates.authentication_status = "failed";
    if (status === "shipped_to_buyer" && tracking) updates.buyer_tracking_number = tracking;
    if (status === "refunded_disputed") updates.dispute_reason = reason || "Refund or dispute";

    if (status === "authentication_passed") {
      const missing = REQUIRED_AUTHENTICATION_CHECKS.filter((key) => submittedChecklist?.[key] !== true);
      if (missing.length) return NextResponse.json({ error: `Complete every PullShield authentication check before approval (${missing.length} remaining).` }, { status: 409 });
      if (submittedEvidence.length < 2) return NextResponse.json({ error: "Add at least two verification photos (front and back) before approving authentication." }, { status: 409 });
      updates.authentication_status = "passed";
      updates.authentication_checklist = submittedChecklist;
      updates.authentication_evidence_urls = submittedEvidence;
      updates.authentication_notes = submittedNotes || null;
      updates.authenticated_by = user.email ?? "PullShield operator";
      updates.authenticated_at = new Date().toISOString();

      if (!order.stripeTransferId) {
        if (!order.stripePaymentIntentId) return NextResponse.json({ error: "The payment has not been confirmed yet." }, { status: 409 });
        const seller = await getSellerAccount(order.sellerUserId);
        if (!seller?.payoutsEnabled) return NextResponse.json({ error: "The seller has not completed payout setup." }, { status: 409 });
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        const chargeId = typeof paymentIntent.latest_charge === "string" ? paymentIntent.latest_charge : paymentIntent.latest_charge?.id;
        if (!chargeId) return NextResponse.json({ error: "A settled charge is required before releasing the seller payout." }, { status: 409 });
        const transfer = await stripe.transfers.create({ amount: order.sellerPayoutCents, currency: order.currency, destination: seller.stripeAccountId, source_transaction: chargeId, metadata: { sale_order_id: String(order.id), listing_id: String(order.listingId), pullshield_verified: "true" } });
        updates.stripe_transfer_id = transfer.id;
        updates.payment_status = "payout_released";
      }
    }

    if (status === "authentication_failed" || status === "refunded_disputed") {
      if (order.stripePaymentIntentId && !order.stripeRefundId) {
        const refund = await getStripe().refunds.create({ payment_intent: order.stripePaymentIntentId, reason: "requested_by_customer" });
        updates.stripe_refund_id = refund.id;
        updates.payment_status = "refunded";
      }
    }
    const updated = await updateSaleOrder(order.id, updates);
    return NextResponse.json({ order: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update the sale order." }, { status: 500 });
  }
}
