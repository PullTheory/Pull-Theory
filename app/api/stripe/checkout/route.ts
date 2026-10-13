import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "../../../lib/stripe";
import { isPaidPlan, paidPlans } from "../../../lib/stripePlans";

export const runtime = "nodejs";

async function resolvePriceId(configuredId: string) {
  // Accept both Stripe Price IDs and legacy Product IDs. Checkout requires a
  // Price ID, but a Product can point at its default recurring Price.
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
    if (!token || !isPaidPlan(requestedPlan)) return NextResponse.json({ error: "Please sign in and choose a paid membership." }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Account service is not configured." }, { status: 503 });
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: "Your sign-in session has expired." }, { status: 401 });

    const plan = paidPlans[requestedPlan];
    const configuredPriceId = process.env[plan.priceEnv];
    if (!configuredPriceId) return NextResponse.json({ error: "Payments are not configured yet. Please try again shortly." }, { status: 503 });

    const priceId = await resolvePriceId(configuredPriceId);
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://pulltheorytrade.com";
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      client_reference_id: data.user.id,
      customer_email: data.user.email,
      metadata: { user_id: data.user.id, plan: requestedPlan, credits: String(plan.credits) },
      subscription_data: { metadata: { user_id: data.user.id, plan: requestedPlan, credits: String(plan.credits) } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
