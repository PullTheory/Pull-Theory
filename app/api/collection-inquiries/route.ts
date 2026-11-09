import { NextResponse } from "next/server";
import { sendNotification } from "../../lib/notifications";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const recentSubmissions = new Map<string, number[]>();
const NO_STORE = { "Cache-Control": "no-store" };

function overLimit(key: string) {
  const now = Date.now();
  if (recentSubmissions.size > 1000) {
    for (const [address, times] of recentSubmissions) {
      const fresh = times.filter((time) => now - time < 60 * 60 * 1000);
      if (fresh.length) recentSubmissions.set(address, fresh);
      else recentSubmissions.delete(address);
    }
  }
  const recent = (recentSubmissions.get(key) ?? []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 5) return true;
  recent.push(now);
  recentSubmissions.set(key, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return NextResponse.json({ error: "Please submit the form using the website." }, { status: 415, headers: NO_STORE });
    }

    const body = await request.json();
    // Quiet honeypot: bots receive a success response without triggering email.
    if (typeof body?.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true }, { headers: NO_STORE });
    }

    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (overLimit(ip)) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429, headers: NO_STORE });
    }

    const name = String(body?.name ?? "").trim().replace(/\s+/g, " ").slice(0, 100);
    const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 160);
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
      return NextResponse.json({ error: "Please complete your name, valid email, collection size, details, and consent." }, { status: 400, headers: NO_STORE });
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
      "This is an inquiry only. Do not promise a price or accept custody of cards until the owner has received and agreed to written terms.",
    ].join("\n");

    const sent = await sendNotification(recipient, subject, message);
    if (!sent) {
      return NextResponse.json({ error: "The inquiry email service is not configured yet. Please email PullTheory@gmail.com directly instead." }, { status: 503, headers: NO_STORE });
    }

    // Send a simple receipt to the address supplied by the collector.
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

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    console.error("[collection-inquiry] submission failed", error);
    return NextResponse.json({ error: "We couldn't send your inquiry. Please try again or contact PullTheory directly." }, { status: 500, headers: NO_STORE });
  }
}
