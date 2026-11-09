import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/tradesStore";
import { isPullTheoryOperator } from "../../../lib/operator";
import { getLifecycleSummary, getSignupSummary, getTrafficSummary } from "../../../lib/trafficStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    const user = await getUserFromToken(token);
    if (!user || !isPullTheoryOperator(user.email)) {
      return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    }

    const [traffic, signups, lifecycle] = await Promise.all([
      getTrafficSummary(),
      getSignupSummary(),
      getLifecycleSummary(),
    ]);
    if (!traffic) {
      return NextResponse.json({
        error: "Traffic storage is not connected. Check the Supabase URL and service-role environment variables in Vercel.",
        code: "TRAFFIC_STORAGE_UNAVAILABLE",
      }, { status: 503 });
    }

    return NextResponse.json(
      { traffic, signups, lifecycle, generatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("[api/owner/traffic] unable to load analytics", error);
    return NextResponse.json(
      { error: "Analytics could not be loaded. Check the traffic table and Supabase permissions." },
      { status: 500, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }
}
