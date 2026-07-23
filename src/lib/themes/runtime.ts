import "server-only";

import type { ThemeContent, ThemeMedia } from "./contract";
import { getDefaultTheme } from "./registry";

export function getActiveTheme() {
  return getDefaultTheme();
}

export function createThemeContent(
  content: {
    id: string;
    kind: "page" | "post";
    slug: string;
    title: string;
    excerpt: string | null;
    body: string;
    publishedAt: Date | null;
    layout?: "article" | "scrollytelling";
  },
  media: ThemeMedia | null,
  terms: ThemeContent["terms"] = [],
): ThemeContent {
  return { ...content, featuredMedia: media, terms };
}
