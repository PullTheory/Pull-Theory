import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    .from("binders")
    .select("id, name, binder_cards(collection_id)")
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ binders: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Binder name is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("binders")
    .insert([{ user_id: sessionData.session.user.id, name }])
    .select("id, name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ binder: data });
}

export async function PUT(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json();
  const id = body?.id;
  const name = body?.name?.trim();
  if (!id || !name) return NextResponse.json({ error: "Binder id and name are required." }, { status: 400 });

  const { data, error } = await supabase
    .from("binders")
    .update({ name })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ binder: data });
}

export async function DELETE(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json();
  const id = body?.id;
  if (!id) return NextResponse.json({ error: "Binder id is required." }, { status: 400 });

  const { data: binder } = await supabase.from("binders").select("id").eq("id", id).eq("user_id", userId).maybeSingle();
  if (!binder) return NextResponse.json({ error: "Binder not found." }, { status: 404 });

  const { error: cardsError } = await supabase.from("binder_cards").delete().eq("binder_id", id);
  if (cardsError) return NextResponse.json({ error: cardsError.message }, { status: 500 });

  const { error } = await supabase.from("binders").delete().eq("id", id).eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
