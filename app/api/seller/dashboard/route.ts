import { NextResponse } from "next/server";
import { getSellerAccount, getSaleOrdersForUser, saveSellerAccount } from "../../../lib/salesStore";
import { getTrades, getUserFromToken } from "../../../lib/tradesStore";
import { getStripe } from "../../../lib/stripe";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const user = await getUserFromToken(authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
    if (!user) return NextResponse.json({ error: "Please sign in to view seller tools." }, { status: 401 });
    let [seller, listings, orders] = await Promise.all([
      getSellerAccount(user.id),
      getTrades({ user_id: user.id, is_listing: true, page: 1, pageSize: 500 }),
      getSaleOrdersForUser(user.id),
    ]);
    if (seller) {
      const account = await getStripe().accounts.retrieve(seller.stripeAccountId);
      seller = await saveSellerAccount({ userId: user.id, stripeAccountId: account.id, chargesEnabled: account.charges_enabled, payoutsEnabled: account.payouts_enabled, detailsSubmitted: account.details_submitted });
    }
    return NextResponse.json({ seller, listings: listings.items, sales: orders.filter((order) => order.sellerUserId === user.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load seller dashboard." }, { status: 500 });
  }
}
