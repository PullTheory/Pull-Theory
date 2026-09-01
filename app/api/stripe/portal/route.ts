import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "../../../lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!token || !url || !anonKey || !serviceKey) return NextResponse.json({ error: "Account service is not configured." }, { status: 503 });

    const auth = createClient(url, anonKey);
    const { data } = await auth.auth.getUser(token);
    if (!data.user) return NextResponse.json({ error: "Please sign in to manage your membership." }, { status: 401 });

    const admin = createClient(url, serviceKey);
    const { data: memberships, error } = await admin
      .from("memberships")
      .select("stripe_customer_id")
      .eq("user_id", data.user.id)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (error) console.warn("[stripe/portal] Membership table unavailable; using Stripe customer lookup", { code: error.code });
    const membership = error ? null : memberships?.[0] ?? null;
    let customerId = membership?.stripe_customer_id ?? null;
    // The webhook may still be catching up after checkout. Fall back to the
    // signed-in email so a genuine Stripe subscriber can still manage billing.
    if (!customerId && data.user.email) {
      const customers = await getStripe().customers.list({ email: data.user.email, limit: 1 });
      customerId = customers.data[0]?.id ?? null;
    }
    if (!customerId) return NextResponse.json({ error: "No Stripe membership was found for this account. Choose a plan from Memberships first." }, { status: 404 });

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://pulltheorytrade.com";
    const session = await getStripe().billingPortal.sessions.create({ customer: customerId, return_url: `${origin}/profile` });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to open membership settings." }, { status: 500 });
  }
}
