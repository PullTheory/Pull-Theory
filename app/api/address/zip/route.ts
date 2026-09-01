import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const zip = new URL(request.url).searchParams.get("zip")?.replace(/\D/g, "") ?? "";
  if (zip.length !== 5) return NextResponse.json({ error: "Enter a five-digit ZIP code." }, { status: 400 });

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "ZIP code not found." }, { status: 404 });
    const data = await response.json();
    const place = data?.places?.[0];
    if (!place?.["place name"] || !place?.["state abbreviation"]) {
      return NextResponse.json({ error: "ZIP code not found." }, { status: 404 });
    }
    return NextResponse.json({ city: place["place name"], state: place["state abbreviation"] });
  } catch {
    return NextResponse.json({ error: "Unable to look up this ZIP code right now." }, { status: 503 });
  }
}
