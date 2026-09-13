import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

function adminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}
async function authenticatedUser(request: Request) {
  const admin = adminClient(); if (!admin) return { admin: null, user: null };
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return { admin, user: null };
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return { admin, user: null };
  return { admin, user: data.user };
}
async function prizeForUser(admin: NonNullable<ReturnType<typeof adminClient>>, userId: string) {
  const { data: claim } = await admin.from("welcome_rip_claims").select("prize_id,claimed_at").eq("user_id", userId).maybeSingle();
  if (!claim?.prize_id) return null;
  const { data: prize } = await admin.from("welcome_rip_prizes").select("id,tier,display_name,value_min_cents,value_max_cents,card_name,card_set,card_number,image_url").eq("id", claim.prize_id).maybeSingle();
  return prize ? { ...prize, claimed_at: claim.claimed_at } : null;
}
async function counts(admin: NonNullable<ReturnType<typeof adminClient>>) {
  const [{ count: remaining }, { count: chaseRemaining }] = await Promise.all([
    admin.from("welcome_rip_prizes").select("id", { count: "exact", head: true }).is("claimed_by", null),
    admin.from("welcome_rip_prizes").select("id", { count: "exact", head: true }).eq("tier", "chase").is("claimed_by", null),
  ]);
  return { remaining: remaining ?? 0, chaseRemaining: chaseRemaining ?? 0 };
}
export async function GET(request: Request) {
  const { admin, user } = await authenticatedUser(request);
  if (!admin) return NextResponse.json({ error: "Welcome Rip is temporarily unavailable." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const [{ data: settings }, prize, inventory] = await Promise.all([
    admin.from("welcome_rip_settings").select("launch_at,active").eq("singleton", true).maybeSingle(), prizeForUser(admin, user.id), counts(admin),
  ]);
  const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
  const launchAt = settings?.launch_at ? new Date(settings.launch_at).getTime() : Number.MAX_SAFE_INTEGER;
  const confirmed = Boolean(user.email_confirmed_at);
  const eligible = Boolean(settings?.active && confirmed && createdAt >= launchAt && (inventory.remaining > 0 || prize));
  return NextResponse.json({ active: Boolean(settings?.active), eligible, confirmed, alreadyClaimed: Boolean(prize), prize, ...inventory });
}
export async function POST(request: Request) {
  const { admin, user } = await authenticatedUser(request);
  if (!admin) return NextResponse.json({ error: "Welcome Rip is temporarily unavailable." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await admin.rpc("claim_welcome_rip", { target_user_id: user.id });
  if (error) { console.error("Welcome Rip claim failed:", error); return NextResponse.json({ error: "We couldn't open your Welcome Rip. Please try again." }, { status: 500 }); }
  const prize = Array.isArray(data) ? data[0] : data;
  if (!prize) {
    const { data: settings } = await admin.from("welcome_rip_settings").select("launch_at,active").eq("singleton", true).maybeSingle();
    const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
    const launchAt = settings?.launch_at ? new Date(settings.launch_at).getTime() : Number.MAX_SAFE_INTEGER;
    if (!settings?.active) return NextResponse.json({ error: "The Welcome Rip promotion is not active." }, { status: 410 });
    if (!user.email_confirmed_at) return NextResponse.json({ error: "Confirm your email before opening your Welcome Rip." }, { status: 403 });
    if (createdAt < launchAt) return NextResponse.json({ error: "Welcome Rips are reserved for new accounts created during this launch." }, { status: 403 });
    return NextResponse.json({ error: "All 100 Welcome Rips have been claimed." }, { status: 410 });
  }
  const inventory = await counts(admin);
  return NextResponse.json({ ok: true, prize, ...inventory });
}
