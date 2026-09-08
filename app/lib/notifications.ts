import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM = process.env.MAIL_FROM || 'Pull Theory <notifications@pulltheorytrade.com>';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const admin = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

let transporter: nodemailer.Transporter | null = null;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

type NotificationOptions = {
  from?: string;
  html?: string;
};

export async function sendNotification(to: string, subject: string, text: string, options: NotificationOptions = {}) {
  const from = options.from || FROM;
  if (RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        ...(options.html ? { html: options.html } : {}),
        headers: {
          "X-Entity-Ref-ID": crypto.randomUUID(),
        },
      }),
    });
    if (!response.ok) throw new Error(`Email delivery failed: ${await response.text()}`);
    return true;
  }
  if (transporter) {
    await transporter.sendMail({ from, to, subject, text, ...(options.html ? { html: options.html } : {}) });
    return true;
  }
  // fallback to console for development
  // eslint-disable-next-line no-console
  console.log('sendNotification:', { to, subject, text });
  return false;
}

export async function notifyMembersOfNewListing(input: { listingId: number; offeredCard: string; desiredCard: string; ownerUserId?: string | null }) {
  if (!admin || (!RESEND_API_KEY && !transporter)) return { sent: 0, configured: false };
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const recipients = (data.users ?? [])
    .filter((user) => user.email && user.email_confirmed_at && String(user.id) !== String(input.ownerUserId))
    .map((user) => user.email!);
  const subject = `New trade listing: ${input.offeredCard}`;
  const text = `A collector just listed ${input.offeredCard} on Pull Theory.${input.desiredCard ? `\n\nThey are looking for: ${input.desiredCard}` : ""}\n\nView the listing and make an offer: https://pulltheorytrade.com/marketplace/${input.listingId}\n\nPull Theory — trade cards without trusting a stranger.`;
  const results = await Promise.allSettled(recipients.map((email) => sendNotification(email, subject, text)));
  return { sent: results.filter((result) => result.status === "fulfilled" && result.value).length, configured: true };
}
