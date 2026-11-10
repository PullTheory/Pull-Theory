import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SHOP = "https://pulltheorytrade.myshopify.com";

type ProductImage = string | { id?: number; src?: string; alt?: string | null };
type Product = {
  id: number;
  title: string;
  handle: string;
  body_html?: string;
  description?: string;
  vendor?: string;
  product_type?: string;
  images?: ProductImage[];
  variants?: { id: number; title: string; price: string; available: boolean; sku?: string | null }[];
};

async function getProduct(handle: string): Promise<Product | null> {
  try {
    const response = await fetch(`${SHOP}/products/${encodeURIComponent(handle)}.js`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return (await response.json()) as Product;
  } catch {
    return null;
  }
}

function plainText(html?: string) {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function imageSource(image: ProductImage): string {
  return typeof image === "string" ? image : image.src || "";
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  const description = plainText(product?.description || product?.body_html);
  return {
    title: product ? `${product.title} | PullTheoryTrade` : "Product | PullTheoryTrade",
    description: description.slice(0, 155) || "Shop trading card products at PullTheoryTrade.",
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const variants = product.variants || [];
  const available = variants.filter((variant) => variant.available);
  const variant = available[0] || variants[0];
  const description = plainText(product.description || product.body_html);
  const images = (product.images || [])
    .map((image, index) => ({
      key: typeof image === "string" ? `${image}-${index}` : image.id ?? index,
      src: imageSource(image),
      alt: typeof image === "string" ? product.title : image.alt || product.title,
    }))
    .filter((image) => image.src);

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/shopify" className="text-sm font-bold text-amber-200 hover:text-white">
          ← Back to shop
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="grid grid-cols-2 gap-3">
            {images.slice(0, 4).map((image, index) => (
              <div
                key={image.key}
                className={`relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#101827] ${index === 0 ? "col-span-2" : ""}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  unoptimized
                  sizes="(max-width:1024px) 90vw,55vw"
                  className="object-contain p-5"
                />
              </div>
            ))}
          </div>
          <div className="h-fit rounded-3xl border border-white/10 bg-[#101827] p-6 sm:p-8 lg:sticky lg:top-6">
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">
              {product.product_type || "Trading cards"} · {product.vendor || "PullTheoryTrade"}
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {product.title}
            </h1>
            <p className="mt-5 text-3xl font-black text-amber-100">
              {variant
                ? Number(variant.price).toLocaleString("en-US", { style: "currency", currency: "USD" })
                : "See store price"}
            </p>
            <p className={`mt-3 text-sm font-bold ${available.length ? "text-emerald-200" : "text-slate-400"}`}>
              {available.length ? "Available to order" : "Currently unavailable"}
            </p>
            {variant && (
              <a
                href={`${SHOP}/cart/${variant.id}:1`}
                className={`mt-7 flex min-h-13 w-full items-center justify-center rounded-xl px-6 py-4 text-sm font-black uppercase tracking-wide transition ${available.length ? "bg-amber-200 text-slate-950 hover:bg-amber-100" : "pointer-events-none bg-white/10 text-slate-500"}`}
              >
                Add to cart · Shopify checkout ↗
              </a>
            )}
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Your cart and payment are handled securely by the PullTheoryTrade Shopify store. Final
              availability and shipping are confirmed at checkout.
            </p>
            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="text-lg font-black">Product details</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">
                {description || "See the product details at checkout."}
              </p>
              {variant?.sku && <p className="mt-4 text-xs text-slate-500">SKU: {variant.sku}</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
