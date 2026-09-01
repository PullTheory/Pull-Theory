import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "../../../lib/stripe";

export const runtime = "nodejs";

function describeError(error: unknown) {
  if (!error || typeof error !== "object") return { value: String(error) };
  const value = error as Record<string, unknown>;
  return {
    name: typeof value.name === "string" ? value.name : undefined,
    message: typeof value.message === "string" ? value.message : undefined,
    code: typeof value.code === "string" ? value.code : undefined,
    type: typeof value.type === "string" ? value.type : undefined,
    status: typeof value.status === "number" ? value.status : undefined,
    statusCode: typeof value.statusCode === "number" ? value.statusCode : undefined,
    details: typeof value.details === "string" ? value.details : undefined,
    hint: typeof value.hint === "string" ? value.hint : undefined,
  };
}

export async function POST(request: Request) {
  let stage = "starting";
  try {
    stage = "reading authentication";
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!token || !url || !anonKey || !serviceKey) {
      return NextResponse.json({ error: "Account service is not configured." }, { status: 503 });
    }

    stage = "checking signed-in user";
    const auth = createClient(url, anonKey);
    const { data: authData } = await auth.auth.getUser(token);
    const user = authData.user;
    if (!user) {
      return NextResponse.json({ error: "Please sign in to cancel your membership." }, { status: 401 });
    }

    stage = "loading membership";
    const admin = createClient(url, serviceKey);
    // Older Pull Theory projects may not have the optional memberships table.
    // Cancellation still works by securely locating the member in Stripe below.
    let membership: { stripe_customer_id: string | null; stripe_subscription_id: string | null } | null = null;
    const { data: memberships, error } = await admin
      .from("memberships")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (error) {
      console.warn("[stripe/cancel] Membership table unavailable; using Stripe customer lookup", { code: error.code });
    } else {
      membership = memberships?.[0] ?? null;
    }

    stage = "connecting to Stripe";
    const stripe = getStripe();
    let customerId = membership?.stripe_customer_id ?? null;
    let subscriptionId = membership?.stripe_subscription_id ?? null;

    if (!customerId && user.email) {
      stage = "finding Stripe customer";
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0]?.id ?? null;
    }

    if (!subscriptionId && customerId) {
      stage = "finding active Stripe subscription";
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 20,
      });
      const activeSubscription = subscriptions.data.find((subscription) =>
        ["active", "trialing", "past_due"].includes(subscription.status),
      );
      subscriptionId = activeSubscription?.id ?? null;
    }

    if (!subscriptionId) {
      return NextResponse.json({ error: "No active paid membership was found for this account." }, { status: 404 });
    }

    stage = "scheduling Stripe cancellation";
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Stripe is the billing source of truth. A nonessential local status update
    // must never tell a member that cancellation failed after Stripe accepted it.
    stage = "updating local membership";
    if (membership) {
      const { error: updateError } = await admin
        .from("memberships")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (updateError) {
        console.error("[stripe/cancel] Stripe cancellation succeeded but membership sync failed", {
          userId: user.id,
          subscriptionId: subscription.id,
          error: updateError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your membership will end after the current paid billing period.",
    });
  } catch (error) {
    const description = describeError(error);
    console.error("[stripe/cancel] failed", { stage, ...description });
    return NextResponse.json(
      { error: description.message ?? "Unable to cancel membership.", stage },
      { status: 500 },
    );
  }
}
