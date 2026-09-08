import { NextResponse } from "next/server";
import { getStripe } from "../../../lib/stripe";
import { getSellerAccount, saveSellerAccount } from "../../../lib/salesStore";
import { getUserFromToken } from "../../../lib/tradesStore";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const user = await getUserFromToken(authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
    if (!user) return NextResponse.json({ error: "Please sign in to set up seller payouts." }, { status: 401 });

    const stripe = getStripe();
    let seller = await getSellerAccount(user.id);
    if (!seller) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: user.email ?? undefined,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { pull_theory_user_id: user.id },
      });
      seller = await saveSellerAccount({ userId: user.id, stripeAccountId: account.id, chargesEnabled: account.charges_enabled, payoutsEnabled: account.payouts_enabled, detailsSubmitted: account.details_submitted });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const accountLink = await stripe.accountLinks.create({
      account: seller.stripeAccountId,
      refresh_url: `${origin}/seller?connect=refresh`,
      return_url: `${origin}/seller?connect=complete`,
      type: "account_onboarding",
    });
    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start seller onboarding." }, { status: 500 });
  }
}
