import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getPublishedBySlug, listTermsForContent } from "@/lib/content/repository";
import { getMediaById } from "@/lib/media/repository";
import { createThemeContent, getActiveTheme } from "@/lib/themes/runtime";
import { createContentMetadata, createContentStructuredData, safeStructuredData } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedBySlug(getDb(), "page", slug);
  if (!page) return {};
  const featured = page.featuredMediaId ? await getMediaById(getDb(), page.featuredMediaId) : null;
  return createContentMetadata(page, featured ? { id: featured.id, altText: featured.altText, width: featured.width, height: featured.height } : null);
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedBySlug(getDb(), "page", slug);
  if (!page) notFound();
  const featured = page.featuredMediaId ? await getMediaById(getDb(), page.featuredMediaId) : null;
  const content = createThemeContent(page, featured ? {
    id: featured.id,
    altText: featured.altText,
    caption: featured.caption,
    width: featured.width,
    height: featured.height,
  } : null, await listTermsForContent(getDb(), page.id));
  const theme = getActiveTheme();
  const PageTemplate = theme.templates.Page;
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeStructuredData(await createContentStructuredData(page, featured ? { id: featured.id, altText: featured.altText, width: featured.width, height: featured.height } : null)) }} /><PageTemplate content={content} manifest={theme.manifest} /></>;
}
