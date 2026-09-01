import { NextResponse } from "next/server";
import { recordVisit } from "../../lib/trafficStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId : "";
    const path = typeof body?.path === "string" ? body.path : "/";
    if (!visitorId || visitorId.length > 100) return NextResponse.json({ error: "Invalid visit." }, { status: 400 });
    await recordVisit(visitorId, path);
    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error("[api/traffic] unable to record visit", error);
    return NextResponse.json({ recorded: false }, { status: 202 });
  }
}
