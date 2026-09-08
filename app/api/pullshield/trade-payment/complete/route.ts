import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripe";
import { markPullShieldCheckoutPaid } from "../../../../lib/pullshieldBilling";
import { approveOffer } from "../../../../lib/tradesStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  try {
    const sessionId = new URL(request.url).searchParams.get("session_id");
    if (!sessionId) return NextResponse.redirect(`${origin}/offers?pullshield=payment_error`);
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const offerId = Number(session.metadata?.offer_id);
    const userId = session.metadata?.user_id;
    if (session.metadata?.kind !== "pullshield_trade" || session.payment_status !== "paid" || !Number.isInteger(offerId) || !userId) {
      return NextResponse.redirect(`${origin}/offers?pullshield=payment_error`);
    }
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    await markPullShieldCheckoutPaid({ offerId, userId, sessionId: session.id, paymentIntentId });
    const offer = await approveOffer(offerId, userId);
    if (!offer) return NextResponse.redirect(`${origin}/offers?pullshield=already_processed`);
    return NextResponse.redirect(`${origin}/offers?pullshield=paid&offer=${offerId}`);
  } catch (error) {
    console.error("[PullShield payment complete]", error);
    return NextResponse.redirect(`${origin}/offers?pullshield=payment_error`);
  }
}
