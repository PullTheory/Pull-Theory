import { NextResponse } from "next/server";
import { getSaleOrder, updateSaleOrder } from "../../../../lib/salesStore";
import { getUserFromToken } from "../../../../lib/tradesStore";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const user = await getUserFromToken(authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
    if (!user) return NextResponse.json({ error: "Please sign in to add shipment tracking." }, { status: 401 });
    const { id: rawId } = await params;
    const id = Number(rawId);
    const { trackingNumber } = await request.json();
    const tracking = String(trackingNumber ?? "").trim();
    if (!Number.isInteger(id) || !tracking) return NextResponse.json({ error: "A sale order and tracking number are required." }, { status: 400 });
    const order = await getSaleOrder(id);
    if (!order || String(order.sellerUserId) !== String(user.id)) return NextResponse.json({ error: "Sale order not found." }, { status: 404 });
    if (!["waiting_for_seller_shipment", "received_by_pulltheory"].includes(order.orderStatus)) return NextResponse.json({ error: "Tracking can no longer be changed for this sale." }, { status: 409 });
    const updated = await updateSaleOrder(order.id, { seller_tracking_number: tracking });
    return NextResponse.json({ order: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save shipment tracking." }, { status: 500 });
  }
}
