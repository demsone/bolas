import type { Metadata } from "next";
import { getDb } from "@/lib/db/client";
import { getSiteSettings } from "@/lib/settings/repository";
import { getSiteOrigin } from "./site";

type SeoContent = {
  kind: "page" | "post";
  slug: string;
  title: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  publishedAt: Date | null;
};

type SeoMedia = { id: string; altText: string; width: number; height: number } | null;

export async function createContentMetadata(content: SeoContent, media: SeoMedia): Promise<Metadata> {
  const settings = await getSiteSettings(getDb());
  const path = content.kind === "post" ? `/journal/${content.slug}` : `/${content.slug}`;
  const url = content.canonicalUrl || new URL(path, getSiteOrigin()).toString();
  const description = content.seoDescription || content.excerpt || settings.siteDescription;
  const image = media ? { url: new URL(`/media/${media.id}`, getSiteOrigin()).toString(), width: media.width, height: media.height, alt: media.altText || content.title } : undefined;
  return {
    title: content.seoTitle || content.title,
    description,
    alternates: { canonical: url },
    robots: content.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: content.seoTitle || content.title,
      description,
      url,
      siteName: settings.siteName,
      type: content.kind === "post" ? "article" : "website",
      ...(content.kind === "post" && content.publishedAt ? { publishedTime: content.publishedAt.toISOString() } : {}),
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: content.seoTitle || content.title, description, ...(image ? { images: [image.url] } : {}) },
  };
}

export async function createContentStructuredData(content: SeoContent, media: SeoMedia) {
  const settings = await getSiteSettings(getDb());
  const path = content.kind === "post" ? `/journal/${content.slug}` : `/${content.slug}`;
  const description = content.seoDescription || content.excerpt || settings.siteDescription;
  return {
    "@context": "https://schema.org",
    "@type": content.kind === "post" ? "Article" : "WebPage",
    headline: content.title,
    name: content.title,
    description,
    url: new URL(path, getSiteOrigin()).toString(),
    ...(content.publishedAt ? { datePublished: content.publishedAt.toISOString() } : {}),
    ...(media ? { image: [new URL(`/media/${media.id}`, getSiteOrigin()).toString()] } : {}),
    publisher: { "@type": "Organization", name: settings.siteName },
  };
}

export function safeStructuredData(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
