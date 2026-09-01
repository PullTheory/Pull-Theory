import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "../../../lib/stripe";
import { isPaidPlan, paidPlans } from "../../../lib/stripePlans";

export const runtime = "nodejs";

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
    const priceId = process.env[plan.priceEnv];
    if (!priceId) return NextResponse.json({ error: "Payments are not configured yet. Please try again shortly." }, { status: 503 });

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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start checkout." }, { status: 500 });
  }
}
