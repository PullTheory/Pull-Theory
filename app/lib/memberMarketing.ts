import crypto from "crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM = process.env.MAIL_FROM || "Pull Theory <notifications@pulltheorytrade.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pulltheorytrade.com";

function admin() {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Member email database is not configured.");
  return createClient(SUPABASE_URL, SERVICE_KEY);
}

function signUserId(userId: string) {
  if (!SERVICE_KEY) throw new Error("Unsubscribe signing is not configured.");
  return crypto.createHmac("sha256", SERVICE_KEY).update(userId).digest("base64url");
}

export function makeUnsubscribeUrl(userId: string) {
  return `${SITE_URL}/unsubscribe?u=${encodeURIComponent(userId)}&s=${encodeURIComponent(signUserId(userId))}`;
}

export function verifyUnsubscribeToken(userId: string, signature: string) {
  const expected = signUserId(userId);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function listConfirmedMembers() {
  const db = admin();
  const members: Array<{ id: string; email: string }> = [];
  let page = 1;
  while (true) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const users = data.users ?? [];
    for (const user of users) {
      if (user.email && user.email_confirmed_at) members.push({ id: user.id, email: user.email });
    }
    if (users.length < 1000) break;
    page += 1;
  }
  return members;
}

export async function getMarketingAudienceCount() {
  const db = admin();
  const [members, preferences] = await Promise.all([
    listConfirmedMembers(),
    db.from("marketing_preferences").select("user_id,marketing_enabled"),
  ]);
  if (preferences.error) throw preferences.error;
  const disabled = new Set((preferences.data ?? []).filter((row) => row.marketing_enabled === false).map((row) => String(row.user_id)));
  return { confirmed: members.length, eligible: members.filter((member) => !disabled.has(member.id)).length };
}

async function sendOne(input: { userId: string; to: string; subject: string; text: string; html?: string }) {
  const unsubscribeUrl = makeUnsubscribeUrl(input.userId);
  const text = `${input.text.trim()}\n\nManage marketing emails: ${unsubscribeUrl}`;
  const html = input.html ? `${input.html}<p style="margin-top:28px;font-size:12px;color:#777">Don’t want product update emails? <a href="${unsubscribeUrl}">Unsubscribe</a>.</p>` : undefined;

  if (RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject: input.subject,
        text,
        ...(html ? { html } : {}),
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Entity-Ref-ID": crypto.randomUUID(),
        },
      }),
    });
    if (!response.ok) throw new Error(`Email delivery failed: ${await response.text()}`);
    return true;
  }

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
    await transporter.sendMail({ from: FROM, to: input.to, subject: input.subject, text, html, headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
    return true;
  }

  throw new Error("Email delivery is not configured.");
}

export async function sendMemberAnnouncement(input: { subject: string; text: string; html?: string }) {
  const subject = input.subject.trim().slice(0, 140);
  const text = input.text.trim().slice(0, 12000);
  if (!subject || !text) throw new Error("Subject and message are required.");

  const db = admin();
  const [members, preferences] = await Promise.all([
    listConfirmedMembers(),
    db.from("marketing_preferences").select("user_id,marketing_enabled"),
  ]);
  if (preferences.error) throw preferences.error;
  const disabled = new Set((preferences.data ?? []).filter((row) => row.marketing_enabled === false).map((row) => String(row.user_id)));
  const recipients = members.filter((member) => !disabled.has(member.id));

  let sent = 0;
  let failed = 0;
  for (const member of recipients) {
    try {
      await sendOne({ userId: member.id, to: member.email, subject, text, html: input.html });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error("[member marketing] delivery failed", member.id, error);
    }
  }
  return { sent, failed, eligible: recipients.length };
}

export async function optOutMarketing(userId: string) {
  const { error } = await admin().from("marketing_preferences").upsert({ user_id: userId, marketing_enabled: false, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}
