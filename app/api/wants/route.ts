import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromToken } from "../../lib/tradesStore";
import { recordLifecycleEvent } from "../../lib/trafficStore";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const admin = () => url && serviceKey ? createClient(url, serviceKey) : null;

async function userFor(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return getUserFromToken(authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
}

export async function GET(request: Request) {
  const user = await userFor(request); const supabase = admin();
  if (!user) return NextResponse.json({ error: "Please sign in to view your Want List." }, { status: 401 });
  if (!supabase) return NextResponse.json({ error: "Want Lists are not configured yet." }, { status: 503 });
  const { data, error } = await supabase.from("wanted_cards").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ wants: data ?? [] });
}

export async function POST(request: Request) {
  const user = await userFor(request); const supabase = admin();
  if (!user) return NextResponse.json({ error: "Please sign in to add a card to your Want List." }, { status: 401 });
  if (!supabase) return NextResponse.json({ error: "Want Lists are not configured yet." }, { status: 503 });
  const body = await request.json(); const cardName = String(body?.card_name ?? body?.name ?? "").trim(); const cardId = String(body?.card_id ?? body?.id ?? "");
  if (!cardName) return NextResponse.json({ error: "A card name is required." }, { status: 400 });
  if (cardId) { const { data: existing } = await supabase.from("wanted_cards").select("id").eq("user_id", user.id).eq("card_id", cardId).maybeSingle(); if (existing) return NextResponse.json({ alreadyAdded: true, want: existing }); }
  const { data, error } = await supabase.from("wanted_cards").insert({ user_id: user.id, card_id: cardId || null, card_name: cardName, card_set: String(body?.card_set ?? body?.set ?? "") || null, card_number: String(body?.card_number ?? "") || null, image_url: String(body?.image_url ?? "") || null }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recordLifecycleEvent(user.id, "first_want_added");
  return NextResponse.json({ want: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await userFor(request); const supabase = admin(); const id = Number(new URL(request.url).searchParams.get("id"));
  if (!user) return NextResponse.json({ error: "Please sign in to update your Want List." }, { status: 401 });
  if (!supabase) return NextResponse.json({ error: "Want Lists are not configured yet." }, { status: 503 });
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "A valid Want List item is required." }, { status: 400 });
  const { error } = await supabase.from("wanted_cards").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
