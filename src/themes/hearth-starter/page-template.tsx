import type { ThemeContentTemplateProps } from "@/lib/themes/contract";
import { ArticleLayout } from "./article-layout";

export function StarterPageTemplate({ content, manifest }: ThemeContentTemplateProps) {
  return <ArticleLayout content={content} label="Page" manifest={manifest} />;
}
