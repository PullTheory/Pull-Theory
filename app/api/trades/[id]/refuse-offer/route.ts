import { NextResponse } from "next/server";
import { getUserFromToken, refuseOffer } from "../../../../lib/tradesStore";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid offer." }, { status: 400 });
    }

    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Please sign in to refuse an offer." }, { status: 401 });

    const offer = await refuseOffer(id, user.id);
    if (!offer) return NextResponse.json({ error: "That offer cannot be refused." }, { status: 404 });
    return NextResponse.json({ offer });
  } catch (error) {
    console.error("[api/trades/refuse-offer] failed", error);
    return NextResponse.json({ error: "Unable to refuse this offer." }, { status: 500 });
  }
}
