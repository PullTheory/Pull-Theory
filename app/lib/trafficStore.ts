import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const supabase = url && serviceKey ? createClient(url, serviceKey) : null;

export type TrafficSummary = {
  today: number;
  week: number;
  allTime: number;
  pageViews: number;
  daily: Array<{ label: string; visitors: number }>;
  pages: Array<{ path: string; views: number; visitors: number }>;
  onePageVisitors: number;
  funnel: Array<{ id: string; label: string; visitors: number }>;
};

export type SignupSummary = {
  today: number;
  week: number;
  allTime: number;
};

export type LifecycleSummary = { id: string; label: string; members: number }[];

const lifecycleSteps = [
  ["visitor", "Visitor"], ["signup_started", "Signup started"], ["account_created", "Account created"],
  ["first_card_added", "First card added"], ["first_tradeable_card", "First tradeable card"], ["first_want_added", "First Want added"],
  ["first_pullmatch", "First PullMatch"], ["first_offer", "First offer"], ["offer_accepted", "Offer accepted"],
  ["pullshield_started", "PullShield started"], ["cards_received", "Cards received"], ["cards_verified", "Cards verified"], ["trade_completed", "Trade completed"],
] as const;

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function recordVisit(visitorId: string, path: string) {
  if (!supabase) return false;
  const safeVisitorId = visitorId.slice(0, 100);
  const safePath = path.startsWith("/") ? path.slice(0, 300) : "/";
  const { error } = await supabase.from("site_visits").insert({ visitor_id: safeVisitorId, path: safePath });
  if (error) throw error;
  return true;
}

export async function recordLifecycleEvent(memberId: string | null | undefined, eventType: string) {
  if (!supabase || !memberId) return false;
  if (!lifecycleSteps.some(([id]) => id === eventType) || ["visitor", "signup_started", "account_created"].includes(eventType)) return false;
  const { error } = await supabase.from("lifecycle_events").upsert({ member_id: memberId, event_type: eventType }, { onConflict: "member_id,event_type", ignoreDuplicates: true });
  if (error) throw error;
  return true;
}

export async function getTrafficSummary(): Promise<TrafficSummary | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_visits")
    .select("visitor_id, visited_at, path")
    .order("visited_at", { ascending: false })
    .limit(10_000);
  if (error) throw error;

  const rows = data ?? [];
  const pageRows = rows.filter((row) => !row.path.startsWith("/__funnel/"));
  const funnelRows = rows.filter((row) => row.path.startsWith("/__funnel/"));
  const now = new Date();
  const today = dayKey(now);
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  weekStart.setUTCHours(0, 0, 0, 0);
  const daily = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekStart);
    date.setUTCDate(date.getUTCDate() + offset);
    const key = dayKey(date);
    const visitors = new Set(pageRows.filter((row) => dayKey(new Date(row.visited_at)) === key).map((row) => row.visitor_id)).size;
    return { label: date.toLocaleDateString("en-US", { weekday: "short" }), visitors };
  });
  const paths = new Map<string, { views: number; visitors: Set<string> }>();
  const visitorPaths = new Map<string, Set<string>>();
  for (const row of pageRows) {
    const entry = paths.get(row.path) ?? { views: 0, visitors: new Set<string>() };
    entry.views += 1;
    entry.visitors.add(row.visitor_id);
    paths.set(row.path, entry);
    const visited = visitorPaths.get(row.visitor_id) ?? new Set<string>();
    visited.add(row.path);
    visitorPaths.set(row.visitor_id, visited);
  }

  const funnelSteps = [
    ["marketplace_gate_seen", "Marketplace gate seen"],
    ["signup_opened", "Opened sign-up"],
    ["signup_submitted", "Submitted sign-up"],
    ["confirmation_sent", "Confirmation email shown"],
    ["login_completed", "Logged in"],
  ] as const;

  return {
    today: new Set(pageRows.filter((row) => dayKey(new Date(row.visited_at)) === today).map((row) => row.visitor_id)).size,
    week: new Set(pageRows.filter((row) => new Date(row.visited_at) >= weekStart).map((row) => row.visitor_id)).size,
    allTime: new Set(pageRows.map((row) => row.visitor_id)).size,
    pageViews: pageRows.length,
    daily,
    pages: Array.from(paths.entries()).map(([path, data]) => ({ path, views: data.views, visitors: data.visitors.size })).sort((a, b) => b.views - a.views).slice(0, 6),
    onePageVisitors: Array.from(visitorPaths.values()).filter((paths) => paths.size === 1).length,
    funnel: funnelSteps.map(([id, label]) => ({
      id,
      label,
      visitors: new Set(funnelRows.filter((row) => row.path === `/__funnel/${id}`).map((row) => row.visitor_id)).size,
    })),
  };
}

export async function getSignupSummary(): Promise<SignupSummary | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;

  const users = data.users ?? [];
  const now = new Date();
  const today = dayKey(now);
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  weekStart.setUTCHours(0, 0, 0, 0);

  return {
    today: users.filter((user) => dayKey(new Date(user.created_at)) === today).length,
    week: users.filter((user) => new Date(user.created_at) >= weekStart).length,
    allTime: users.length,
  };
}

export async function getLifecycleSummary(): Promise<LifecycleSummary | null> {
  if (!supabase) return null;
  const [{ data: visits, error: visitsError }, { data: events, error: eventsError }, { data: users, error: usersError }] = await Promise.all([
    supabase.from("site_visits").select("visitor_id, path").limit(10_000),
    supabase.from("lifecycle_events").select("member_id, event_type").limit(10_000),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  if (visitsError || eventsError || usersError) throw visitsError ?? eventsError ?? usersError;
  const pageVisitors = new Set((visits ?? []).filter((row) => !row.path.startsWith("/__funnel/")).map((row) => row.visitor_id)).size;
  const signupVisitors = new Set((visits ?? []).filter((row) => row.path === "/__funnel/signup_started").map((row) => row.visitor_id)).size;
  return lifecycleSteps.map(([id, label]) => ({
    id, label,
    members: id === "visitor" ? pageVisitors : id === "signup_started" ? signupVisitors : id === "account_created" ? (users?.users ?? []).length : new Set((events ?? []).filter((event) => event.event_type === id).map((event) => event.member_id)).size,
  }));
}
