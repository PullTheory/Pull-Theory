import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { recordLifecycleEvent } from "../../lib/trafficStore";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function toNumeric(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const number = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cards: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const cardId = body?.id ?? body?.card_id;
  const cardName = body?.name ?? body?.card_name;

  if (!cardId || !cardName) {
    return NextResponse.json({ error: "Card id and name are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("collections")
    .insert([
      {
        user_id: sessionData.session.user.id,
        card_id: cardId,
        card_name: cardName,
        card_set: body.set,
        card_number: body.card_number,
        language: body.language,
        rarity: body.rarity,
        quantity_owned: body.quantity_owned,
        current_market_value: toNumeric(body.current_market_value),
        purchased_price: toNumeric(body.purchased_price),
        estimated_condition: body.estimated_condition,
        estimated_grade: body.estimated_grade,
        date_acquired: body.date_acquired || null,
        storage_location: body.storage_location,
        personal_notes: body.personal_notes,
        price: toNumeric(body.price),
        image_url: body.image_url,
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recordLifecycleEvent(sessionData.session.user.id, "first_card_added");
  return NextResponse.json({ success: true, item: data });
}

export async function DELETE(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body?.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Card id is required." }, { status: 400 });

  // Remove binder links first, then delete only a card owned by the signed-in collector.
  const { error: linkError } = await supabase.from("binder_cards").delete().eq("collection_id", id);
  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_id", sessionData.session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body?.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Card id is required." }, { status: 400 });

  const { data, error } = await supabase
    .from("collections")
    .update({
      quantity_owned: Number.isFinite(Number(body.quantity_owned)) ? Math.max(1, Number(body.quantity_owned)) : 1,
      current_market_value: toNumeric(body.current_market_value),
      estimated_condition: String(body.estimated_condition ?? "").trim() || null,
      estimated_grade: body.is_graded ? String(body.estimated_grade ?? "").trim() || "Graded (details not provided)" : null,
      personal_notes: String(body.personal_notes ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("user_id", sessionData.session.user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, item: data });
}
