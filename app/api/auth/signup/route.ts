import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "../../../lib/notifications";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const VALID_PLANS = new Set(["collector", "trader", "pro", "elite"]);

function isExistingAccountError(error: { code?: string; message?: string }) {
  return error.code === "user_already_exists"
    || error.code === "email_exists"
    || /already (?:been )?registered|already exists/i.test(error.message || "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const username = String(body?.username || "").trim();
    const plan = String(body?.plan || "collector");
    const termsAccepted = body?.termsAccepted === true;

    if (!termsAccepted) {
      return NextResponse.json({ error: "You must accept the Pull Theory Terms and PullShield Rules before creating an account." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username)) {
      return NextResponse.json({ error: "Choose a username with 3–24 letters, numbers, hyphens, or underscores." }, { status: 400 });
    }
    if (!VALID_PLANS.has(plan)) {
      return NextResponse.json({ error: "Choose a valid membership plan." }, { status: 400 });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error("Signup email flow is missing Supabase server credentials.");
      return NextResponse.json({ error: "Account signup is temporarily unavailable." }, { status: 503 });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          username,
          membership_plan: plan,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          terms_version: "2026-08-30",
        },
      },
    });

    if (error) {
      if (isExistingAccountError(error)) {
        return NextResponse.json({ ok: true, existing: true });
      }
      console.error("Supabase signup link generation failed:", error);
      return NextResponse.json({ error: "We couldn't create your account right now. Please try again." }, { status: 500 });
    }

    const actionLink = data?.properties?.action_link;
    const userId = data?.user?.id;
    if (!actionLink) {
      console.error("Supabase signup link generation returned no action link.");
      if (userId) await admin.auth.admin.deleteUser(userId).catch(() => undefined);
      return NextResponse.json({ error: "We couldn't create your confirmation email. Please try again." }, { status: 500 });
    }

    try {
      await sendNotification(
        email,
        "Confirm your Pull Theory account",
        `Confirm your email address to finish creating your Pull Theory account.\n\nConfirm email: ${actionLink}\n\nIf you did not request this account, you can ignore this email.\n\nPull Theory`
      );
    } catch (emailError) {
      console.error("Pull Theory confirmation email delivery failed:", emailError);
      if (userId) await admin.auth.admin.deleteUser(userId).catch(() => undefined);
      return NextResponse.json({ error: "We couldn't send your confirmation email. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Signup route failed:", error);
    return NextResponse.json({ error: "Account signup is temporarily unavailable." }, { status: 500 });
  }
}
