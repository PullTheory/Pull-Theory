import { createClient } from "@supabase/supabase-js";

export type PullShieldPlan = "collector" | "trader" | "pro" | "elite";

export const pullShieldExtraTradePrices: Record<PullShieldPlan, number> = {
  collector: 999,
  trader: 799,
  pro: 599,
  elite: 499,
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("PullShield billing is not configured.");
  return createClient(url, key);
}

export async function getPullShieldAccess(userId: string, offerId: number) {
  const db = admin();
  const [{ data: membership, error: membershipError }, { data: payment, error: paymentError }] = await Promise.all([
    db.from("memberships").select("plan,status,authentication_credits,stripe_customer_id").eq("user_id", userId).maybeSingle(),
    db.from("pullshield_trade_payments").select("status,stripe_checkout_session_id").eq("offer_id", offerId).eq("user_id", userId).maybeSingle(),
  ]);
  if (membershipError) throw membershipError;
  if (paymentError) throw paymentError;
  const rawPlan = membership?.status === "active" ? membership?.plan : "collector";
  const plan: PullShieldPlan = rawPlan === "trader" || rawPlan === "pro" || rawPlan === "elite" ? rawPlan : "collector";
  return {
    plan,
    credits: Math.max(0, Number(membership?.authentication_credits ?? 0)),
    customerId: membership?.stripe_customer_id ?? null,
    paid: payment?.status === "paid",
    checkoutSessionId: payment?.stripe_checkout_session_id ?? null,
    amountCents: pullShieldExtraTradePrices[plan],
  };
}

export async function consumePullShieldCredit(userId: string) {
  const db = admin();
  const { data, error } = await db.from("memberships").select("authentication_credits").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  const credits = Math.max(0, Number(data?.authentication_credits ?? 0));
  if (credits < 1) return false;
  const { data: updated, error: updateError } = await db.from("memberships").update({ authentication_credits: credits - 1, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("authentication_credits", credits).select("user_id").maybeSingle();
  if (updateError) throw updateError;
  return Boolean(updated);
}

export async function savePullShieldCheckout(input: { offerId: number; userId: string; plan: PullShieldPlan; amountCents: number; sessionId: string }) {
  const { error } = await admin().from("pullshield_trade_payments").upsert({ offer_id: input.offerId, user_id: input.userId, plan: input.plan, amount_cents: input.amountCents, status: "pending", stripe_checkout_session_id: input.sessionId, updated_at: new Date().toISOString() }, { onConflict: "offer_id,user_id" });
  if (error) throw error;
}

export async function markPullShieldCheckoutPaid(input: { offerId: number; userId: string; sessionId: string; paymentIntentId?: string | null }) {
  const { error } = await admin().from("pullshield_trade_payments").upsert({ offer_id: input.offerId, user_id: input.userId, status: "paid", stripe_checkout_session_id: input.sessionId, stripe_payment_intent_id: input.paymentIntentId ?? null, updated_at: new Date().toISOString() }, { onConflict: "offer_id,user_id" });
  if (error) throw error;
}
