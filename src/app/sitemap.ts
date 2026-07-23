import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db/client";
import { listContent } from "@/lib/content/repository";
import { getSiteOrigin } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();
  const origin = getSiteOrigin();
  const entries: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/journal`, changeFrequency: "weekly", priority: 0.8 },
  ];
  for (const item of await listContent(db)) {
    if (item.state !== "published" || item.noIndex) continue;
    entries.push({ url: new URL(item.kind === "post" ? `/journal/${item.slug}` : `/${item.slug}`, origin).toString(), lastModified: item.updatedAt, changeFrequency: "monthly", priority: item.kind === "post" ? 0.7 : 0.8 });
  }
  return entries;
}
