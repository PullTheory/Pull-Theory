import { NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const cardNumber = url.searchParams.get("number")?.trim() ?? "";
  const requestedLimit = Number(url.searchParams.get("limit") ?? "250");
  const pageSize = Number.isFinite(requestedLimit)
    ? Math.min(250, Math.max(1, Math.floor(requestedLimit)))
    : 250;
  const apiKey = process.env.POKEMON_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "POKEMON_API_KEY is not configured." }, { status: 500 });
  }

  const endpointUrl = new URL("https://api.pokemontcg.io/v2/cards");
  // The Pokémon TCG API allows up to 250 cards per search. This keeps large
  // searches such as Pikachu (244+ printings) together on one page.
  endpointUrl.searchParams.set("pageSize", String(pageSize));

  if (query) {
    // Include card variants such as "Mimikyu ex" and "Charizard V".
    const searchableQuery = query.replace(/[^a-zA-Z0-9 '\-]/g, "").trim();
    const quotedName = (searchableQuery || query).replace(/"/g, "\\\"");
    const nameQuery = cardNumber
      ? `name:\"${quotedName}\"`
      : `name:${quotedName}*`;
    const numberQuery = cardNumber.replace(/[^a-zA-Z0-9\-]/g, "");
    endpointUrl.searchParams.set("q", numberQuery ? `${nameQuery} number:\"${numberQuery}\"` : nameQuery);
  } else if (cardNumber) {
    endpointUrl.searchParams.set("q", `number:\"${cardNumber.replace(/[^a-zA-Z0-9\-]/g, "")}\"`);
  }

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(endpointUrl.toString(), {
        headers: {
          "X-Api-Key": apiKey,
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        const body = await response.text();
        lastError = `Pokemon API failure: ${response.status} ${body}`;

        // The provider occasionally rate-limits bursts of keystroke searches.
        // Retry those temporary responses before reporting a failure.
        if ((response.status === 429 || response.status >= 500) && attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after"));
          await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 350 * attempt);
          continue;
        }

        return NextResponse.json({ error: lastError }, { status: 500 });
      }

      const json = await response.json();
      return NextResponse.json(
        { cards: json.data ?? [], totalCount: json.totalCount ?? 0 },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
      );
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < 2) {
        await sleep(300 * attempt);
        continue;
      }
    }
  }

  return NextResponse.json(
    { error: lastError ?? "Pokemon API search failed due to an unexpected error." },
    { status: 500 }
  );
}
