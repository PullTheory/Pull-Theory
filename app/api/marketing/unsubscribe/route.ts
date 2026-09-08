import { NextResponse } from "next/server";
import { optOutMarketing, verifyUnsubscribeToken } from "../../../lib/memberMarketing";

export const runtime = "nodejs";

async function unsubscribe(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("u") ?? "";
    const signature = url.searchParams.get("s") ?? "";
    if (!userId || !signature || !verifyUnsubscribeToken(userId, signature)) return NextResponse.json({ error: "Invalid unsubscribe link." }, { status: 400 });
    await optOutMarketing(userId);
    return NextResponse.json({ unsubscribed: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to unsubscribe." }, { status: 500 });
  }
}

export async function GET(request: Request) { return unsubscribe(request); }
export async function POST(request: Request) { return unsubscribe(request); }
