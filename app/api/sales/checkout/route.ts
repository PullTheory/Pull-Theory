import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "../../../lib/stripe";
import {
  createSaleOrder,
  getPurchasableListing,
  getSellerAccount,
  updateSaleOrder,
} from "../../../lib/salesStore";
import { getUserFromToken } from "../../../lib/tradesStore";

const sellerFeeBasisPoints = {
  collector: 800,
  trader: 650,
  pro: 500,
  elite: 350,
} as const;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Membership database is not configured.");
  }

  return createClient(url, key);
}

async function getSellerPlan(userId: string) {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("memberships")
    .select("plan,status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || data.status !== "active") {
    return "collector";
  }

  const plan = String(data.plan ?? "collector").toLowerCase();

  if (plan === "trader" || plan === "pro" || plan === "elite") {
    return plan;
  }

  return "collector";
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";

    const user = await getUserFromToken(
      authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : null,
    );

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in before buying a card." },
        { status: 401 },
      );
    }

    const { listingId: rawListingId } = await request.json();
    const listingId = Number(rawListingId);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return NextResponse.json(
        { error: "A valid listing is required." },
        { status: 400 },
      );
    }

    const listing = await getPurchasableListing(listingId);

    if (!listing || !listing.user_id || !listing.salePriceCents) {
      return NextResponse.json(
        { error: "This card is no longer available to purchase." },
        { status: 404 },
      );
    }

    if (String(listing.user_id) === String(user.id)) {
      return NextResponse.json(
        { error: "You cannot purchase your own listing." },
        { status: 400 },
      );
    }

    const seller = await getSellerAccount(listing.user_id);

    if (!seller?.payoutsEnabled) {
      return NextResponse.json(
        { error: "This seller has not finished secure payout setup yet." },
        { status: 409 },
      );
    }

    const sellerPlan = await getSellerPlan(String(listing.user_id));
    const platformFeeBps = sellerFeeBasisPoints[sellerPlan];
    const platformFeeRate = platformFeeBps / 10_000;

    const platformFeeCents = Math.round(
      listing.salePriceCents * platformFeeRate,
    );

  const order = await createSaleOrder({
  listing,
  buyerUserId: user.id,
  platformFeeCents,
  platformFeeBps,
  sellerPlan,
});
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: listing.currency || "usd",
            product_data: {
              name: listing.offeredCard,
              description: "PullShield-authenticated marketplace sale",
            },
            unit_amount: listing.salePriceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: "marketplace_sale",
        sale_order_id: String(order.id),
        listing_id: String(listing.id),
        buyer_user_id: user.id,
        seller_plan: sellerPlan,
        platform_fee_bps: String(platformFeeBps),
      },
      payment_intent_data: {
        metadata: {
          kind: "marketplace_sale",
          sale_order_id: String(order.id),
          listing_id: String(listing.id),
          seller_plan: sellerPlan,
          platform_fee_bps: String(platformFeeBps),
        },
      },
      success_url: `${origin}/seller?purchase=success`,
      cancel_url: `${origin}/marketplace/${listing.id}?purchase=cancelled`,
    });

    await updateSaleOrder(order.id, {
      stripe_checkout_session_id: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start secure checkout.",
      },
      { status: 500 },
    );
  }
}