import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Entrant = { id: string; username: string; email: string; signedUpAt: string; emailConfirmed: boolean };

export async function GET(request: Request) {
  const suppliedSecret = request.headers.get("x-authenticator-secret");
  const expectedSecret = process.env.AUTHENTICATOR_SECRET;
  if (!expectedSecret || !suppliedSecret || suppliedSecret !== expectedSecret) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return Response.json({ error: "Giveaway entrant access is not configured." }, { status: 503 });

  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const entrants: Entrant[] = [];
  const perPage = 1000;
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    entrants.push(...data.users.map((user) => ({ id: user.id, username: (typeof user.user_metadata?.username === "string" && user.user_metadata.username.trim()) || "No username", email: user.email || "No email", signedUpAt: user.created_at, emailConfirmed: Boolean(user.email_confirmed_at) })));
    if (data.users.length < perPage) break;
    page += 1;
  }
  entrants.sort((a, b) => Date.parse(b.signedUpAt) - Date.parse(a.signedUpAt));
  return Response.json({ entrants, total: entrants.length }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
