import { NextResponse } from "next/server";
import { normalizeCardNumber } from "../../../lib/cardNumber";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const cardNumber = normalizeCardNumber(url.searchParams.get("number") ?? "");
  const requestedLimit = Number(url.searchParams.get("limit") ?? "250");
  const resultLimit = Number.isFinite(requestedLimit)
    ? Math.min(300, Math.max(1, Math.floor(requestedLimit)))
    : 250;
  const apiKey = process.env.POKEMON_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "POKEMON_API_KEY is not configured." }, { status: 500 });
  }

  const searchableQuery = query.replace(/[^a-zA-Z0-9 '\-]/g, "").trim();
  const providerNumber = cardNumber.replace(/[^a-zA-Z0-9\-]/g, "");

  let providerQuery = "";
  if (query) {
    const searchName = searchableQuery || query;
    const nameQuery = `name:${searchName.split(/\s+/)[0]}*`;
    providerQuery = providerNumber ? `${nameQuery} number:${providerNumber}*` : nameQuery;
  } else if (cardNumber) {
    providerQuery = `number:${providerNumber}*`;
  }

  const pageRequests: Array<{ page: number; pageSize: number }> = [];
  let remaining = resultLimit;
  let page = 1;
  while (remaining > 0) {
    const pageSize = Math.min(250, remaining);
    pageRequests.push({ page, pageSize });
    remaining -= pageSize;
    page += 1;
  }

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const collected: any[] = [];
      for (const requestPage of pageRequests) {
        const endpointUrl = new URL("https://api.pokemontcg.io/v2/cards");
        if (providerQuery) endpointUrl.searchParams.set("q", providerQuery);
        endpointUrl.searchParams.set("page", String(requestPage.page));
        endpointUrl.searchParams.set("pageSize", String(requestPage.pageSize));

        const response = await fetch(endpointUrl.toString(), {
          headers: { "X-Api-Key": apiKey, Accept: "application/json" },
          next: { revalidate: 300 },
        });

        if (!response.ok) {
          const body = await response.text();
          lastError = `Pokemon API failure: ${response.status} ${body}`;
          if ((response.status === 429 || response.status >= 500) && attempt < 2) {
            const retryAfter = Number(response.headers.get("retry-after"));
            await sleep(
              Number.isFinite(retryAfter) && retryAfter > 0
                ? Math.min(retryAfter * 1000, 1000)
                : 350 * attempt,
            );
            throw new Error("retry");
          }
          return NextResponse.json({ error: lastError }, { status: 500 });
        }

        const json = await response.json();
        const data = Array.isArray(json.data) ? json.data : [];
        collected.push(...data);
        if (data.length < requestPage.pageSize) break;
      }

      const normalizedName = (searchableQuery || query).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const normalizedNumber = cardNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const cards = collected
        .filter((card: { name?: string; number?: string }) => {
          const nameMatches = !normalizedName || String(card.name ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase().startsWith(normalizedName);
          const numberMatches = !normalizedNumber || String(card.number ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase().startsWith(normalizedNumber);
          return nameMatches && numberMatches;
        })
        .slice(0, resultLimit);

      return NextResponse.json(
        { cards, totalCount: cards.length },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
      );
    } catch (error) {
      if (error instanceof Error && error.message === "retry" && attempt < 2) continue;
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < 2) {
        await sleep(300 * attempt);
        continue;
      }
    }
  }

  return NextResponse.json(
    { error: lastError ?? "Pokemon API search failed due to an unexpected error." },
    { status: 500 },
  );
}
