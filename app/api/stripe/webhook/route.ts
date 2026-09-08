import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getStripe } from "../../../lib/stripe";
import { isPaidPlan, paidPlans } from "../../../lib/stripePlans";
import { getSaleOrder, updateSaleOrder } from "../../../lib/salesStore";
import { markPullShieldCheckoutPaid } from "../../../lib/pullshieldBilling";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Membership database is not configured.");
  return createClient(url, key);
}

async function saveMembership(input: { userId: string; plan: string; credits: number; status: string; customerId?: string | null; subscriptionId?: string | null }) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("memberships").upsert({ user_id: input.userId, plan: input.plan, status: input.status, authentication_credits: input.credits, stripe_customer_id: input.customerId ?? null, stripe_subscription_id: input.subscriptionId ?? null, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  let event: Stripe.Event;
  try { event = getStripe().webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 }); }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.kind === "pullshield_trade") {
        const offerId = Number(session.metadata.offer_id);
        const userId = session.metadata.user_id;
        if (Number.isInteger(offerId) && offerId > 0 && userId && session.payment_status === "paid") {
          const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
          await markPullShieldCheckoutPaid({ offerId, userId, sessionId: session.id, paymentIntentId });
        }
        return NextResponse.json({ received: true });
      }

      if (session.metadata?.kind === "marketplace_sale") {
        const orderId = Number(session.metadata.sale_order_id);
        if (Number.isInteger(orderId) && orderId > 0) {
          const order = await getSaleOrder(orderId);
          if (order && order.paymentStatus !== "paid" && order.paymentStatus !== "payout_released") {
            const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
            await updateSaleOrder(orderId, { stripe_checkout_session_id: session.id, stripe_payment_intent_id: paymentIntentId ?? null, payment_status: "paid", order_status: "waiting_for_seller_shipment" });
            await getAdminClient().from("trades").update({ status: "sold" }).eq("id", order.listingId).eq("status", "pending");
          }
        }
        return NextResponse.json({ received: true });
      }

      const plan = session.metadata?.plan;
      const userId = session.metadata?.user_id || session.client_reference_id;
      if (userId && isPaidPlan(plan)) await saveMembership({ userId, plan, credits: paidPlans[plan].credits, status: "active", customerId: typeof session.customer === "string" ? session.customer : session.customer?.id, subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const { error } = await getAdminClient().from("memberships").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("stripe_subscription_id", subscription.id);
      if (error) throw error;
    }
  } catch (error) {
    console.error("[stripe webhook] processing failed", error);
    return NextResponse.json({ error: "Unable to process Stripe event." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
