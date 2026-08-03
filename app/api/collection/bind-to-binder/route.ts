import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: await cookies() });
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json();
  const collectionId = body?.collectionId;
  const binderId = body?.binderId;

  if (!collectionId || !binderId) {
    return NextResponse.json({ error: "collectionId and binderId are required." }, { status: 400 });
  }

  const { data, error } = await supabase.from("binder_cards").insert([
    {
      binder_id: binderId,
      collection_id: collectionId,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, item: data?.[0] ?? null });
}
