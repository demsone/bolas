import { getDb } from "@/lib/db/client";
import { listPublishedPosts } from "@/lib/content/repository";
import { getSiteOrigin } from "@/lib/seo/site";
import { getSiteSettings } from "@/lib/settings/repository";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET() {
  const settings = await getSiteSettings(getDb());
  const origin = getSiteOrigin();
  const posts = await listPublishedPosts(getDb());
  const items = posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${origin}/journal/${post.slug}</link><guid isPermaLink="true">${origin}/journal/${post.slug}</guid>${post.publishedAt ? `<pubDate>${post.publishedAt.toUTCString()}</pubDate>` : ""}${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ""}</item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(settings.siteName)}</title><link>${origin}</link><description>${escapeXml(settings.siteDescription)}</description><language>${escapeXml(settings.language)}</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Cache-Control": "public, max-age=300", "Content-Type": "application/rss+xml; charset=utf-8" } });
}
