import { createClient } from "@supabase/supabase-js";
import { getUserFromToken } from "../../../lib/tradesStore";
import { isPullTheoryOperator } from "../../../lib/operator";

export const dynamic = "force-dynamic";

type Entrant = { id: string; username: string; email: string; signedUpAt: string; emailConfirmed: boolean };

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  const user = await getUserFromToken(token);
  if (!user || !isPullTheoryOperator(user.email)) {
    return Response.json({ error: "Giveaway entries are only available to the PullShield operator account." }, { status: 403 });
  }

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
