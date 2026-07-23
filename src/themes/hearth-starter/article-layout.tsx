import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MarkdownContent } from "@/components/markdown";
import type { ThemeContent, ThemeManifest } from "@/lib/themes/contract";
import { ScrollyArticle } from "./scrolly-article";
import { SiteHeader } from "./site-header";
import { ThemeFrame } from "./theme-frame";

export function ArticleLayout({ content, label, manifest, headerExtra }: { content: ThemeContent; label: string; manifest: ThemeManifest; headerExtra?: ReactNode }) {
  const featured = content.featuredMedia;
  if (content.layout === "scrollytelling") {
    return (
      <ThemeFrame className="public-shell" manifest={manifest}>
        <SiteHeader />
        <ScrollyArticle content={content} />
      </ThemeFrame>
    );
  }

  return (
    <ThemeFrame className="public-shell" manifest={manifest}>
      <SiteHeader />
      <article className="public-content">
        <p className="eyebrow">{label}</p>
        <h1 className="theme-display mt-4 text-5xl leading-none tracking-[-0.05em] sm:text-7xl">{content.title}</h1>
        {headerExtra}
        {content.terms.length > 0 && <div className="public-taxonomy">{content.terms.map((term) => <Link href={`/journal/${term.kind}/${term.slug}`} key={term.id}>{term.kind === "tag" ? "#" : ""}{term.name}</Link>)}</div>}
        {content.excerpt && <p className="mt-6 text-xl leading-8 text-[var(--muted)]">{content.excerpt}</p>}
        {featured && <><Image alt={featured.altText} className="public-featured-image mt-10" height={featured.height} src={`/media/${featured.id}`} unoptimized width={featured.width} />{featured.caption && <p className="mt-2 text-sm text-[var(--muted)]">{featured.caption}</p>}</>}
        <div className="mt-10 border-t border-[var(--line)] pt-8"><MarkdownContent>{content.body}</MarkdownContent></div>
      </article>
    </ThemeFrame>
  );
}
