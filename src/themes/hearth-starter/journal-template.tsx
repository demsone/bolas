import Link from "next/link";
import type { ThemeJournalTemplateProps } from "@/lib/themes/contract";
import { SiteHeader } from "./site-header";
import { ThemeFrame } from "./theme-frame";

export function StarterJournalTemplate({ description, eyebrow = "Journal", manifest, posts, title = "Latest posts" }: ThemeJournalTemplateProps) {
  return (
    <ThemeFrame className="public-shell" manifest={manifest}>
      <SiteHeader />
      <section className="public-content">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="theme-display mt-4 text-6xl tracking-[-0.05em]">{title}</h1>
        {description && <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">{description}</p>}
        <div className="mt-10 divide-y divide-[var(--line)]">
          {posts.length === 0 ? <p className="py-8 text-[var(--muted)]">No published posts yet.</p> : posts.map((post) => <article className="py-6" key={post.id}><Link className="text-2xl font-semibold tracking-[-0.03em] hover:text-[var(--ember)]" href={`/journal/${post.slug}`}>{post.title}</Link>{post.excerpt && <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">{post.excerpt}</p>}</article>)}
        </div>
      </section>
    </ThemeFrame>
  );
}
