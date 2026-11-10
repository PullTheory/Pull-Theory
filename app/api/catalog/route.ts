import { NextResponse } from "next/server";
const SHOP = "https://pulltheorytrade.myshopify.com";
export const revalidate = 60;
export async function GET() {
  try {
    const response = await fetch(`${SHOP}/products.json?limit=100`, { headers: { Accept: "application/json" }, next: { revalidate: 60 } });
    if (!response.ok) return NextResponse.json({ error: "The store catalog is temporarily unavailable." }, { status: 502 });
    const payload = await response.json();
    const products = (payload.products ?? []).filter((p: any) => p?.handle && Array.isArray(p.variants)).map((p: any) => ({
      id: p.id, handle: p.handle, title: p.title, vendor: p.vendor || "PullTheoryTrade",
      productType: p.product_type || "Trading cards", tags: p.tags || [], image: p.images?.[0]?.src || null,
      price: p.variants?.[0]?.price || "0.00", compareAtPrice: p.variants?.[0]?.compare_at_price || null,
      available: p.variants?.some((v: any) => v.available) ?? false,
    }));
    return NextResponse.json({ products, updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch { return NextResponse.json({ error: "Unable to reach the PullTheoryTrade catalog." }, { status: 502 }); }
}