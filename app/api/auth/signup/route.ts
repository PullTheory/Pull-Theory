import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "../../../lib/notifications";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const VALID_PLANS = new Set(["collector", "trader", "pro", "elite"]);

function isExistingAccountError(error: { code?: string; message?: string }) {
  return error.code === "user_already_exists" || error.code === "email_exists" || /already (?:been )?registered|already exists/i.test(error.message || "");
}
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] || char)); }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const confirmPassword = String(body?.confirmPassword || "");
    const username = String(body?.username || "").trim();
    const plan = String(body?.plan || "collector");
    const referralCode = String(body?.referralCode || "").trim().toUpperCase();
    const termsAccepted = body?.termsAccepted === true;
    if (!termsAccepted) return NextResponse.json({ error: "You must accept the Pull Theory Terms and PullShield Rules before creating an account." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match. Enter the same password twice." }, { status: 400 });
    if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username)) return NextResponse.json({ error: "Choose a username with 3–24 letters, numbers, hyphens, or underscores." }, { status: 400 });
    if (!VALID_PLANS.has(plan)) return NextResponse.json({ error: "Choose a valid membership plan." }, { status: 400 });
    if (referralCode && !/^[A-Z0-9_-]{3,24}$/.test(referralCode)) return NextResponse.json({ error: "That referral code is not valid." }, { status: 400 });
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return NextResponse.json({ error: "Account signup is temporarily unavailable." }, { status: 503 });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
    let referral: { id: number; owner_user_id: string } | null = null;
    if (referralCode) {
      const { data: found } = await admin.from("referral_codes").select("id,owner_user_id").ilike("code", referralCode).eq("active", true).maybeSingle();
      if (!found) return NextResponse.json({ error: "That referral code was not found." }, { status: 400 });
      referral = found;
    }

    const { data, error } = await admin.auth.admin.generateLink({ type: "signup", email, password, options: { data: { username, membership_plan: plan, referral_code: referralCode || null, terms_accepted: true, terms_accepted_at: new Date().toISOString(), terms_version: "2026-08-30" } } });
    if (error) {
      if (isExistingAccountError(error)) return NextResponse.json({ ok: true, existing: true });
      console.error("Supabase signup link generation failed:", error);
      return NextResponse.json({ error: "We couldn't create your account right now. Please try again." }, { status: 500 });
    }
    const actionLink = data?.properties?.action_link; const userId = data?.user?.id;
    if (!actionLink) { if (userId) await admin.auth.admin.deleteUser(userId).catch(() => undefined); return NextResponse.json({ error: "We couldn't create your confirmation email. Please try again." }, { status: 500 }); }

    if (referral && userId && referral.owner_user_id !== userId) {
      const { error: referralError } = await admin.from("referrals").insert({ referral_code_id: referral.id, referred_user_id: userId, referred_email: email, status: "pending", signup_reward_cents: 50, paid_member_bonus_cents: 500 });
      if (referralError) console.error("Referral tracking insert failed:", referralError);
    }

    const safeLink = escapeHtml(actionLink);
    const text = `Welcome to Pull Theory.\n\nConfirm your email address to activate your account:\n${actionLink}\n\nIf you did not create a Pull Theory account, you can ignore this message.\n\nPull Theory\nhttps://pulltheorytrade.com`;
    const html = `<!doctype html><html><body style="margin:0;background:#f5f5f7;font-family:Arial,Helvetica,sans-serif;color:#18181b"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border:1px solid #e4e4e7;border-radius:16px"><tr><td style="padding:32px"><p style="font-weight:700;color:#6d28d9">PULL THEORY</p><h1>Confirm your email</h1><p>Thanks for joining Pull Theory. Confirm your email address to activate your collector account.</p><a href="${safeLink}" style="display:inline-block;padding:14px 22px;background:#6d28d9;border-radius:10px;color:#fff;text-decoration:none;font-weight:700">Confirm email address</a><p style="margin-top:26px;font-size:13px;color:#71717a">If you didn't create an account, you can safely ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
    try { await sendNotification(email, "Confirm your Pull Theory email", text, { from: "Pull Theory <notifications@pulltheorytrade.com>", html }); }
    catch (emailError) { console.error("Pull Theory confirmation email delivery failed:", emailError); if (userId) await admin.auth.admin.deleteUser(userId).catch(() => undefined); return NextResponse.json({ error: "We couldn't send your confirmation email. Please try again." }, { status: 502 }); }
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("Signup route failed:", error); return NextResponse.json({ error: "Account signup is temporarily unavailable." }, { status: 500 }); }
}
