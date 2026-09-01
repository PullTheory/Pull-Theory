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

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const collectionId = body?.collectionId;
  const binderId = body?.binderId;

  if (!collectionId || !binderId) {
    return NextResponse.json({ error: "collectionId and binderId are required." }, { status: 400 });
  }

  const [{ data: binder }, { data: card }] = await Promise.all([
    supabase.from("binders").select("id").eq("id", binderId).eq("user_id", userId).maybeSingle(),
    supabase.from("collections").select("id").eq("id", collectionId).eq("user_id", userId).maybeSingle(),
  ]);

  if (!binder || !card) {
    return NextResponse.json({ error: "That card or binder is not available to your account." }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("binder_cards")
    .select("binder_id")
    .eq("binder_id", binderId)
    .eq("collection_id", collectionId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, message: "Card is already in this binder." });
  }

  const { data, error } = await supabase
    .from("binder_cards")
    .insert([{ binder_id: binderId, collection_id: collectionId }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, item: data });
}
