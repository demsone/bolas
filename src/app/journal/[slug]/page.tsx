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
  const post = await getPublishedBySlug(getDb(), "post", slug);
  if (!post) return {};
  const featured = post.featuredMediaId ? await getMediaById(getDb(), post.featuredMediaId) : null;
  return createContentMetadata(post, featured ? { id: featured.id, altText: featured.altText, width: featured.width, height: featured.height } : null);
}

export default async function PublicPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedBySlug(getDb(), "post", slug);
  if (!post) notFound();
  const featured = post.featuredMediaId ? await getMediaById(getDb(), post.featuredMediaId) : null;
  const content = createThemeContent(post, featured ? {
    id: featured.id,
    altText: featured.altText,
    caption: featured.caption,
    width: featured.width,
    height: featured.height,
  } : null, await listTermsForContent(getDb(), post.id));
  const theme = getActiveTheme();
  const PostTemplate = theme.templates.Post;
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeStructuredData(await createContentStructuredData(post, featured ? { id: featured.id, altText: featured.altText, width: featured.width, height: featured.height } : null)) }} /><PostTemplate content={content} manifest={theme.manifest} /></>;
}
