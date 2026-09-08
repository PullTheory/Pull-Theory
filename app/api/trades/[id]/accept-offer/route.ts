import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripe";
import { consumePullShieldCredit, getPullShieldAccess, savePullShieldCheckout } from "../../../../lib/pullshieldBilling";

type RouteContext = { params: Promise<{ id: string }> };
export const runtime = "nodejs";

export async function POST(req: Request, { params }: RouteContext) {
  const { id: idParam } = await params;
  try {
    const id = Number(idParam);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const { getUserFromToken, approveOffer } = await import("../../../../lib/tradesStore");
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "authentication required" }, { status: 401 });

    const access = await getPullShieldAccess(user.id, id);
    if (!access.paid) {
      if (access.credits > 0) {
        if (!(await consumePullShieldCredit(user.id))) return NextResponse.json({ error: "Your PullShield credit changed. Please try again." }, { status: 409 });
      } else {
        const origin = new URL(req.url).origin;
        const session = await getStripe().checkout.sessions.create({
          mode: "payment",
          customer: access.customerId || undefined,
          customer_email: access.customerId ? undefined : user.email || undefined,
          client_reference_id: user.id,
          line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: access.amountCents, product_data: { name: "PullShield Protected Trade", description: `One-time PullShield trade fee — ${access.plan} member rate` } } }],
          metadata: { kind: "pullshield_trade", offer_id: String(id), user_id: user.id, plan: access.plan },
          payment_intent_data: { metadata: { kind: "pullshield_trade", offer_id: String(id), user_id: user.id, plan: access.plan } },
          success_url: `${origin}/api/pullshield/trade-payment/complete?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/offers?pullshield=cancelled&offer=${id}`,
          automatic_tax: { enabled: true },
        });
        await savePullShieldCheckout({ offerId: id, userId: user.id, plan: access.plan, amountCents: access.amountCents, sessionId: session.id });
        return NextResponse.json({ status: "payment_required", checkoutUrl: session.url, amountCents: access.amountCents, plan: access.plan }, { status: 402 });
      }
    }
    const result = await approveOffer(id, user.id);
    if (!result) return NextResponse.json({ error: "not found or unauthorized" }, { status: 404 });
    return NextResponse.json({ status: "ok", offer: result });
  } catch (error) {
    console.error("[accept-offer] PullShield billing/acceptance failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to accept this offer." }, { status: 400 });
  }
}
