import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTrades, getUserFromToken } from "../../lib/tradesStore";
import { recordLifecycleEvent } from "../../lib/trafficStore";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const user = await getUserFromToken(authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
  if (!user) return NextResponse.json({ error: "Please sign in to view your PullMatches." }, { status: 401 });
  if (!url || !serviceKey) return NextResponse.json({ error: "PullMatches are not configured yet." }, { status: 503 });
  const supabase = createClient(url, serviceKey);
  const [{ data: wants, error: wantsError }, { data: collection, error: collectionError }, listings] = await Promise.all([
    supabase.from("wanted_cards").select("*").eq("user_id", user.id),
    supabase.from("collections").select("id, card_name, image_url").eq("user_id", user.id),
    getTrades({ is_listing: true, page: 1, pageSize: 500 }),
  ]);
  if (wantsError || collectionError) return NextResponse.json({ error: wantsError?.message ?? collectionError?.message ?? "Unable to calculate PullMatches." }, { status: 500 });
  const matches = listings.items.filter((listing) => listing.status === "pending" && String(listing.user_id) !== String(user.id)).flatMap((listing) => (wants ?? []).flatMap((want) => {
    const wantedName = normalize(String(want.card_name));
    if (!wantedName || !normalize(listing.offeredCard).includes(wantedName)) return [];
    const offeredFromCollection = (collection ?? []).find((card) => normalize(listing.desiredCard).includes(normalize(String(card.card_name))));
    return offeredFromCollection ? [{ listing: { id: listing.id, offeredCard: listing.offeredCard, desiredCard: listing.desiredCard, name: listing.name, photoUrls: listing.photoUrls ?? [] }, want, offeredFromCollection }] : [];
  }));
  if (matches.length) await recordLifecycleEvent(user.id, "first_pullmatch");
  return NextResponse.json({ matches, wants: wants ?? [] });
}
