import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "../../../lib/stripe";
import { isPaidPlan, paidPlans } from "../../../lib/stripePlans";

export const runtime = "nodejs";

async function resolvePriceId(configuredId: string) {
  if (configuredId.startsWith("price_")) return configuredId;
  if (!configuredId.startsWith("prod_")) return configuredId;
  const product = await getStripe().products.retrieve(configuredId);
  const defaultPrice = product.default_price;
  const priceId = typeof defaultPrice === "string" ? defaultPrice : defaultPrice?.id;
  if (!priceId) throw new Error("This membership is missing a Stripe recurring price.");
  return priceId;
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const body = await request.json();
    const requestedPlan: unknown = body?.plan;
    const welcomeOffer = body?.welcomeOffer === true;
    if (!token || !isPaidPlan(requestedPlan)) return NextResponse.json({ error: "Please sign in and choose a paid membership." }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Account service is not configured." }, { status: 503 });
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: "Your sign-in session has expired." }, { status: 401 });

    const plan = paidPlans[requestedPlan];
    const configuredPriceId = process.env[plan.priceEnv];
    if (!configuredPriceId) return NextResponse.json({ error: "Payments are not configured yet. Please try again shortly." }, { status: 503 });
    const priceId = await resolvePriceId(configuredPriceId);

    let discountId: string | undefined;
    if (welcomeOffer) {
      if (!serviceKey) return NextResponse.json({ error: "The Welcome Rip offer is not configured." }, { status: 503 });
      const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
      const { data: claim } = await admin.from("welcome_rip_claims").select("id").eq("user_id", data.user.id).maybeSingle();
      if (!claim) return NextResponse.json({ error: "Open your Welcome Rip before using this offer." }, { status: 403 });
      const stripe = getStripe();
      const couponId = "pulltheory-welcome-rip-799";
      try { await stripe.coupons.retrieve(couponId); } catch { await stripe.coupons.create({ id: couponId, name: "Welcome Rip $7.99 Membership", amount_off: 200, currency: "usd", duration: "forever" }); }
      discountId = couponId;
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://pulltheorytrade.com";
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(discountId ? { discounts: [{ coupon: discountId }] } : {}),
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      client_reference_id: data.user.id,
      customer_email: data.user.email,
      metadata: { user_id: data.user.id, plan: requestedPlan, credits: String(plan.credits), ...(welcomeOffer ? { welcome_rip_offer: "7.99" } : {}) },
      subscription_data: { metadata: { user_id: data.user.id, plan: requestedPlan, credits: String(plan.credits), ...(welcomeOffer ? { welcome_rip_offer: "7.99" } : {}) } },
      allow_promotion_codes: !discountId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
