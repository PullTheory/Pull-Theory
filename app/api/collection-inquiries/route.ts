import { NextResponse } from "next/server";
import { sendNotification } from "../../lib/notifications";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recentSubmissions = new Map<string, number[]>();

function overLimit(key: string) {
  const now = Date.now();
  const recent = (recentSubmissions.get(key) ?? []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 5) return true;
  recent.push(now);
  recentSubmissions.set(key, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (overLimit(ip)) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429, headers: { "Cache-Control": "no-store" } });
    }
    const contentLength = Number(request.headers.get("content-length") || 0);\n    if (contentLength > 20000) return NextResponse.json({ error: "Submission is too large. Please shorten the details and try again." }, { status: 413, headers: { "Cache-Control": "no-store" } });\n    const body = await request.json();
    if (typeof body?.website === "string" && body.website.trim()) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });

    const name = String(body?.name ?? "").replace(/[\\r\\n]+/g, " ").trim().slice(0, 100);
    const email = String(body?.email ?? "").trim().slice(0, 160);
    const phone = String(body?.phone ?? "").trim().slice(0, 50);
    const location = String(body?.location ?? "").trim().slice(0, 120);
    const size = String(body?.size ?? "").trim().slice(0, 80);
    const estimatedValue = String(body?.estimatedValue ?? "").trim().slice(0, 80);
    const details = String(body?.details ?? "").trim().slice(0, 2500);
    const preferredContact = ["email", "text", "phone"].includes(body?.preferredContact) ? body.preferredContact : "email";
    const photos = Array.isArray(body?.photos)
      ? body.photos.filter((item: unknown) => typeof item === "string" && /^https:\/\//i.test(item)).slice(0, 5)
      : [];

    if (name.length < 2 || !EMAIL.test(email) || size.length < 2 || details.length < 20 || body?.agree !== true) {
      return NextResponse.json({ error: "Please complete your name, valid email, collection size, details, and consent." }, { status: 400 });
    }

    const recipient = process.env.COLLECTION_INQUIRY_EMAIL || "PullTheory@gmail.com";
    const subject = `New collection-selling inquiry — ${name}`;
    const message = [
      "A new PullTheory collection-selling inquiry was submitted.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Location: ${location || "Not provided"}`,
      `Collection size: ${size}`,
      `Estimated value: ${estimatedValue || "Not sure"}`,
      `Preferred contact: ${preferredContact}`,
      "",
      "Collection details:",
      details,
      "",
      photos.length ? `Photo links:\n${photos.join("\n")}` : "No photo links provided.",
      "",
      "Do not promise a price or accept custody of cards until the owner has received and agreed to written terms.",
    ].join("\n");

    const sent = await sendNotification(recipient, subject, message);
    if (!sent) {
      return NextResponse.json({ error: "The inquiry email service is not configured yet. Please email PullTheory@gmail.com directly instead." }, { status: 503 });
    }
    try {
      await sendNotification(
        email,
        "We received your PullTheory collection inquiry",
        `Thanks for reaching out to PullTheory about your Pokémon collection.

We received your inquiry and will review the details. If it looks like a possible fit, we'll follow up using your preferred contact method.

Please keep your cards with you. Do not mail or hand over any cards unless you have received and agreed to written terms.

PullTheory
https://pulltheorytrade.com`
      );
    } catch (confirmationError) {
      console.error("[collection-inquiry] confirmation email failed", confirmationError);
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[collection-inquiry] submission failed", error);
    return NextResponse.json({ error: "We couldn't send your inquiry. Please try again or contact PullTheory directly." }, { status: 500 });
  }
}
