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
    .from("binders")
    .select("id, name, binder_cards(collection_id)")
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ binders: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: await cookies() });
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Binder name is required." }, { status: 400 });
  }

  const { data, error } = await supabase.from("binders").insert([
    {
      user_id: sessionData.session.user.id,
      name,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ binder: data?.[0] ?? null });
}
