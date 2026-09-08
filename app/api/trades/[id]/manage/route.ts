import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { decodeCardDetails, encodeCardDetails } from "../../../../lib/cardDetails";
import { getTrade, getUserFromToken } from "../../../../lib/tradesStore";

type ListingType = "trade" | "sell" | "trade_or_sell";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const admin = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

function marketValueCents(value?: string) {
  if (!value) return null;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const listingId = Number(rawId);
    if (!Number.isInteger(listingId) || listingId <= 0) {
      return NextResponse.json({ error: "A valid listing is required." }, { status: 400 });
    }

    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: "Please sign in to change this listing." }, { status: 401 });

    const listing = await getTrade(listingId);
    if (!listing || !listing.is_listing || String(listing.user_id) !== String(user.id) || listing.status !== "pending") {
      return NextResponse.json({ error: "Listing not found, no longer active, or not owned by this account." }, { status: 404 });
    }

    const body = await request.json();
    const listingType: ListingType = body?.listingType === "sell" || body?.listingType === "trade_or_sell" ? body.listingType : "trade";
    const salePriceCents = listingType === "trade" ? null : Number(body?.salePriceCents);
    if (listingType !== "trade" && (!Number.isInteger(salePriceCents) || salePriceCents < 100)) {
      return NextResponse.json({ error: "Enter a sale price of at least $1.00." }, { status: 400 });
    }

    const existingDetails = decodeCardDetails(listing.notes);
    const gradingStatus = body?.gradingStatus === "graded" ? "graded" : "raw";
    const gradingCompany = gradingStatus === "graded" ? String(body?.gradingCompany ?? "").trim().slice(0, 30) : "";
    const grade = gradingStatus === "graded" ? String(body?.grade ?? "").trim().slice(0, 12) : "";

    if (gradingStatus === "graded" && (!gradingCompany || !grade)) {
      return NextResponse.json({ error: "Choose the grading company and enter the grade." }, { status: 400 });
    }

    const marketCents = marketValueCents(existingDetails.estimatedValue);
    if (listingType !== "trade" && gradingStatus !== "graded") {
      if (marketCents === null) {
        return NextResponse.json({ error: "Pull Theory could not verify this card's market value. Re-select the card before setting a sale price." }, { status: 400 });
      }
      const maxRawPrice = marketCents + 1000;
      if (salePriceCents! > maxRawPrice) {
        return NextResponse.json({ error: `Raw cards can be listed for at most $10.00 over market value. Maximum price: $${(maxRawPrice / 100).toFixed(2)}.` }, { status: 400 });
      }
    }

    if (!admin) return NextResponse.json({ error: "Listing management is temporarily unavailable." }, { status: 503 });

    const nextDetails = {
      ...existingDetails,
      gradingStatus,
      gradingCompany: gradingCompany || undefined,
      grade: grade || undefined,
    };
    const desiredCard = listingType === "sell" ? "For sale" : "Open to offers";
    const { data, error } = await admin
      .from("trades")
      .update({
        listing_type: listingType,
        sale_price_cents: listingType === "trade" ? null : salePriceCents,
        desired_card: desiredCard,
        notes: encodeCardDetails(nextDetails),
      })
      .eq("id", listingId)
      .eq("user_id", user.id)
      .eq("is_listing", true)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "This listing changed before it could be saved." }, { status: 409 });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("[listing/manage] unable to save listing", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update this listing." }, { status: 500 });
  }
}
