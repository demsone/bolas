import type { ContentKind } from "./types";

export function publicContentUrl(kind: ContentKind, slug: string) {
  return kind === "post" ? `/journal/${slug}` : `/${slug}`;
}
