import type { ThemeContentTemplateProps } from "@/lib/themes/contract";
import { ArticleLayout } from "./article-layout";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "long" }).format(date);
}

export function StarterPostTemplate({ content, manifest }: ThemeContentTemplateProps) {
  const date = content.publishedAt ? <time className="mt-4 block font-mono text-xs text-[var(--muted)]">{formatDate(content.publishedAt)}</time> : null;
  return <ArticleLayout content={content} headerExtra={date} label="Post" manifest={manifest} />;
}
