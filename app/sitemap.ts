import type { MetadataRoute } from "next";
import { guides } from "./lib/communityGuides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pulltheorytrade.com";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/marketplace/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/events`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/sell`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/collection-selling`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/seller-calculator`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/deals`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/guides`, changeFrequency: "weekly", priority: 0.8 },
    ...guides.map((guide) => ({ url: `${base}/guides/${guide.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
