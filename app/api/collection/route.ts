import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: await cookies() });
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("collections")
    .select(
      `id, card_id, card_name, card_set, card_number, language, rarity, quantity_owned, current_market_value, purchased_price, estimated_condition, estimated_grade, date_acquired, storage_location, personal_notes, price, image_url`
    )
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cards: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: await cookies() });
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const {
    id,
    name,
    set,
    card_number,
    language,
    rarity,
    quantity_owned,
    current_market_value,
    purchased_price,
    estimated_condition,
    estimated_grade,
    date_acquired,
    storage_location,
    personal_notes,
    price,
    image_url,
  } = body ?? {};

  if (!id || !name) {
    return NextResponse.json({ error: "Card id and name are required." }, { status: 400 });
  }

  const { data, error } = await supabase.from("collections").insert([
    {
      user_id: sessionData.session.user.id,
      card_id: id,
      card_name: name,
      card_set: set,
      card_number,
      language,
      rarity,
      quantity_owned,
      current_market_value,
      purchased_price,
      estimated_condition,
      estimated_grade,
      date_acquired,
      storage_location,
      personal_notes,
      price,
      image_url,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, item: data?.[0] ?? null });
}
