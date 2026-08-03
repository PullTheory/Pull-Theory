import { NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const apiKey = process.env.POKEMON_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "POKEMON_API_KEY is not configured." }, { status: 500 });
  }

  const endpoint = query
    ? `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}&pageSize=24`
    : `https://api.pokemontcg.io/v2/cards?pageSize=24`;

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "X-Api-Key": apiKey,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const body = await response.text();
        lastError = `Pokemon API failure: ${response.status} ${body}`;

        if (response.status >= 500 && attempt < 3) {
          await sleep(500 * attempt);
          continue;
        }

        return NextResponse.json({ error: lastError }, { status: 500 });
      }

      const json = await response.json();
      return NextResponse.json({ cards: json.data ?? [] });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < 3) {
        await sleep(500 * attempt);
        continue;
      }
    }
  }

  return NextResponse.json(
    { error: lastError ?? "Pokemon API search failed due to an unexpected error." },
    { status: 500 }
  );
}
