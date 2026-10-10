import { createClient } from "@supabase/supabase-js";
import { getUserFromToken } from "../../../lib/tradesStore";
import { isPullTheoryOperator } from "../../../lib/operator";

export const dynamic = "force-dynamic";

const paidPlans = new Set(["trader", "pro", "elite"]);

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
}

async function operator(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const user = await getUserFromToken(authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
  return user && isPullTheoryOperator(user.email) ? user : null;
}

export async function GET(request: Request) {
  if (!await operator(request)) return Response.json({ error: "Operator access required." }, { status: 403 });
  const admin = db();
  if (!admin) return Response.json({ error: "Membership database is not configured." }, { status: 503 });

  const { data: memberships, error } = await admin
    .from("memberships")
    .select("user_id,plan,status,updated_at")
    .in("plan", Array.from(paidPlans))
    .eq("status", "active")
    .order("updated_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const users = new Map<string, { email: string; username: string; createdAt: string }>();
  let page = 1;
  while (true) {
    const { data, error: userError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (userError) return Response.json({ error: userError.message }, { status: 500 });
    for (const user of data.users) {
      users.set(user.id, {
        email: user.email || "No email",
        username: (typeof user.user_metadata?.username === "string" && user.user_metadata.username.trim()) || "No username",
        createdAt: user.created_at,
      });
    }
    if (data.users.length < 1000) break;
    page += 1;
  }

  const entries = (memberships ?? []).map((membership) => {
    const user = users.get(membership.user_id);
    return {
      userId: membership.user_id,
      username: user?.username || "No username",
      email: user?.email || "No email",
      plan: membership.plan,
      status: membership.status,
      membershipUpdatedAt: membership.updated_at,
      accountCreatedAt: user?.createdAt || null,
    };
  });

  return Response.json({ entries, total: entries.length }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
