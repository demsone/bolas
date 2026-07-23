import type { ReactNode } from "react";
import { z } from "zod";

const themeManifestSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/),
  name: z.string().min(1).max(80),
  description: z.string().min(1).max(300),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  author: z.string().min(1).max(80),
  templates: z.array(z.enum(["home", "page", "post", "journal"])).length(4),
  tokens: z.object({
    colors: z.object({
      canvas: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      muted: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      line: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }),
    typography: z.object({
      display: z.string().min(1).max(200),
      body: z.string().min(1).max(200),
      utility: z.string().min(1).max(200),
    }),
    layout: z.object({
      readingWidth: z.string().regex(/^\d+(\.\d+)?(rem|px)$/),
      shellWidth: z.string().regex(/^\d+(\.\d+)?(rem|px)$/),
    }),
  }),
});

export type ThemeManifest = z.infer<typeof themeManifestSchema>;

export type ThemeMedia = {
  id: string;
  altText: string;
  caption: string | null;
  width: number;
  height: number;
};

export type ThemeContent = {
  id: string;
  kind: "page" | "post";
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  publishedAt: Date | null;
  layout?: "article" | "scrollytelling";
  featuredMedia: ThemeMedia | null;
  terms: Array<{ id: string; kind: "category" | "tag"; name: string; slug: string }>;
};

export type ThemePostSummary = Pick<ThemeContent, "id" | "slug" | "title" | "excerpt" | "publishedAt">;

export type ThemeTemplateProps = { manifest: ThemeManifest };
export type ThemeContentTemplateProps = ThemeTemplateProps & { content: ThemeContent };
export type ThemeJournalTemplateProps = ThemeTemplateProps & { posts: ThemePostSummary[]; title?: string; eyebrow?: string; description?: string };
type ServerComponentType<P> = (props: P) => ReactNode | Promise<ReactNode>;

export type HearthThemeDefinition = {
  manifest: ThemeManifest;
  templates: {
    Home: ServerComponentType<ThemeTemplateProps>;
    Page: ServerComponentType<ThemeContentTemplateProps>;
    Post: ServerComponentType<ThemeContentTemplateProps>;
    Journal: ServerComponentType<ThemeJournalTemplateProps>;
  };
};

export function defineTheme(manifestInput: unknown, templates: HearthThemeDefinition["templates"]): HearthThemeDefinition {
  const manifest = themeManifestSchema.parse(manifestInput);
  if (new Set(manifest.templates).size !== 4) throw new Error(`Theme ${manifest.id} must declare each public template once.`);
  return { manifest, templates };
}
