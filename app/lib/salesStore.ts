import { createClient } from "@supabase/supabase-js";
import { getTrade, type Trade } from "./tradesStore";

export const SALE_ORDER_STATUSES = [
  "payment_received", "waiting_for_seller_shipment", "received_by_pulltheory",
  "authentication_in_progress", "authentication_passed", "authentication_failed",
  "shipped_to_buyer", "completed", "refunded_disputed",
] as const;

export type SaleOrderStatus = (typeof SALE_ORDER_STATUSES)[number];
export type AuthenticationChecklist = Record<string, boolean>;

export type SellerAccount = { userId: string; stripeAccountId: string; chargesEnabled: boolean; payoutsEnabled: boolean; detailsSubmitted: boolean };
export type SaleOrder = {
  id: number; listingId: number; sellerUserId: string; buyerUserId: string;
  stripeCheckoutSessionId?: string | null; stripePaymentIntentId?: string | null; stripeTransferId?: string | null; stripeRefundId?: string | null;
  currency: string; itemAmountCents: number; platformFeeCents: number; platformFeeBps: number; sellerPlan: string; sellerPayoutCents: number;
  paymentStatus: string; authenticationStatus: string; orderStatus: SaleOrderStatus | "checkout_started";
  sellerTrackingNumber?: string | null; buyerTrackingNumber?: string | null; disputeReason?: string | null; createdAt?: string | null;
  authenticationChecklist: AuthenticationChecklist; authenticationEvidenceUrls: string[]; authenticationNotes?: string | null;
  authenticatedBy?: string | null; authenticatedAt?: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Sales database is not configured.");
  return createClient(url, key);
}
function normaliseSeller(row: any): SellerAccount { return { userId: row.user_id, stripeAccountId: row.stripe_account_id, chargesEnabled: Boolean(row.charges_enabled), payoutsEnabled: Boolean(row.payouts_enabled), detailsSubmitted: Boolean(row.details_submitted) }; }
function normaliseOrder(row: any): SaleOrder { return {
  id: Number(row.id), listingId: Number(row.listing_id), sellerUserId: row.seller_user_id, buyerUserId: row.buyer_user_id,
  stripeCheckoutSessionId: row.stripe_checkout_session_id, stripePaymentIntentId: row.stripe_payment_intent_id, stripeTransferId: row.stripe_transfer_id, stripeRefundId: row.stripe_refund_id,
  currency: row.currency || "usd", itemAmountCents: Number(row.item_amount_cents), platformFeeCents: Number(row.platform_fee_cents), platformFeeBps: Number(row.platform_fee_bps ?? 0), sellerPlan: row.seller_plan || "collector", sellerPayoutCents: Number(row.seller_payout_cents),
  paymentStatus: row.payment_status, authenticationStatus: row.authentication_status, orderStatus: row.order_status,
  sellerTrackingNumber: row.seller_tracking_number, buyerTrackingNumber: row.buyer_tracking_number, disputeReason: row.dispute_reason, createdAt: row.created_at,
  authenticationChecklist: row.authentication_checklist && typeof row.authentication_checklist === "object" ? row.authentication_checklist : {},
  authenticationEvidenceUrls: Array.isArray(row.authentication_evidence_urls) ? row.authentication_evidence_urls : [],
  authenticationNotes: row.authentication_notes, authenticatedBy: row.authenticated_by, authenticatedAt: row.authenticated_at,
}; }

export async function getSellerAccount(userId: string) { const { data, error } = await admin().from("seller_accounts").select("*").eq("user_id", userId).maybeSingle(); if (error) throw error; return data ? normaliseSeller(data) : null; }
export async function saveSellerAccount(input: SellerAccount) { const { data, error } = await admin().from("seller_accounts").upsert({ user_id: input.userId, stripe_account_id: input.stripeAccountId, charges_enabled: input.chargesEnabled, payouts_enabled: input.payoutsEnabled, details_submitted: input.detailsSubmitted, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).select("*").single(); if (error) throw error; return normaliseSeller(data); }
export async function getSaleOrder(id: number) { const { data, error } = await admin().from("sale_orders").select("*").eq("id", id).maybeSingle(); if (error) throw error; return data ? normaliseOrder(data) : null; }
export async function getSaleOrdersForUser(userId: string) { const { data, error } = await admin().from("sale_orders").select("*").or(`seller_user_id.eq.${userId},buyer_user_id.eq.${userId}`).order("created_at", { ascending: false }); if (error) throw error; return (data ?? []).map(normaliseOrder); }
export async function getAllSaleOrders() { const { data, error } = await admin().from("sale_orders").select("*").order("created_at", { ascending: false }); if (error) throw error; return (data ?? []).map(normaliseOrder); }
export async function createSaleOrder(input: { listing: Trade; buyerUserId: string; platformFeeCents: number; platformFeeBps: number; sellerPlan: string }) {
  if (!input.listing.user_id || !input.listing.salePriceCents) throw new Error("This listing cannot be purchased.");
  if (String(input.listing.user_id) === String(input.buyerUserId)) throw new Error("You cannot purchase your own listing.");
  const { data, error } = await admin().rpc("reserve_marketplace_sale_order", {
    p_listing_id: Number(input.listing.id), p_buyer_user_id: String(input.buyerUserId),
    p_platform_fee_cents: input.platformFeeCents, p_platform_fee_bps: input.platformFeeBps,
    p_seller_plan: input.sellerPlan,
  }).single();
  if (error) {
    if (error.message.includes("LISTING_CHECKOUT_IN_PROGRESS")) throw new Error("This card is currently being checked out by another buyer.");
    if (error.message.includes("LISTING_UNAVAILABLE")) throw new Error("This card is no longer available to purchase.");
    throw error;
  }
  return normaliseOrder(data);
}
export async function updateSaleOrder(id: number, updates: Record<string, unknown>) {
  if (updates.stripe_refund_id && (await getSaleOrder(id))?.stripeTransferId) throw new Error("A seller payout has already been released; a normal refund cannot be issued against this order.");
  const { data, error } = await admin().from("sale_orders").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select("*").single(); if (error) throw error; return normaliseOrder(data);
}
export async function getPurchasableListing(id: number) { const listing = await getTrade(id); if (!listing || !listing.is_listing || (listing.status && listing.status !== "pending")) return null; if ((listing.listingType !== "sell" && listing.listingType !== "trade_or_sell") || !listing.salePriceCents) return null; return listing; }
