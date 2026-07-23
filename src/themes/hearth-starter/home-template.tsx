import Link from "next/link";
import Image from "next/image";
import { listPublishedPosts } from "@/lib/content/repository";
import { getDb } from "@/lib/db/client";
import { getMediaById } from "@/lib/media/repository";
import { getSiteSettings } from "@/lib/settings/repository";
import type { ThemeTemplateProps } from "@/lib/themes/contract";
import { ThemeFrame } from "./theme-frame";

function formatDate(date: Date | null) {
  if (!date) return "Draft";
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export async function StarterHomeTemplate({ manifest }: ThemeTemplateProps) {
  const db = getDb();
  const settings = await getSiteSettings(db);
  const hero = settings.homeHeroMediaId ? await getMediaById(db, settings.homeHeroMediaId) : null;
  const posts = await listPublishedPosts(db, 5);
  return (
    <ThemeFrame className="bg-[var(--ash)] text-[var(--ink)]" manifest={manifest}>
      <section className="relative min-h-[84vh] overflow-hidden border-b border-[var(--line)]">
        {hero && <Image alt={hero.altText} className="absolute inset-0 size-full object-cover" height={hero.height} priority src={`/media/${hero.id}`} unoptimized width={hero.width} />}
        <div className={`absolute inset-0 ${hero ? "bg-black/35" : "bg-[var(--paper)]"}`} />
        <header className="relative z-10 flex items-center justify-between px-5 py-5 text-sm sm:px-9">
          <Link className={`font-semibold ${hero ? "text-white" : ""}`} href="/">{settings.siteName}</Link>
          <nav className={`flex gap-5 ${hero ? "text-white" : "text-[var(--muted)]"}`}><Link href="/journal">Journal</Link><Link href="/admin">Admin</Link></nav>
        </header>
        <div className="relative z-10 mx-auto flex min-h-[calc(84vh-4rem)] max-w-[var(--theme-shell-width)] items-end px-5 pb-10 pt-24 sm:px-9">
          <div className={hero ? "text-white" : ""}>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] opacity-80">Magazine</p>
            <h1 className="theme-display text-7xl leading-[0.82] sm:text-8xl lg:text-[11rem]">{settings.siteName}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 opacity-85">{settings.siteDescription}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[var(--theme-shell-width)] px-5 py-12 sm:px-9">
        <div className="flex items-end justify-between border-b border-[var(--line)] pb-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Latest articles</h2>
          <Link className="text-sm font-semibold" href="/journal">All stories</Link>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {posts.length === 0 ? <p className="py-10 text-[var(--muted)]">No published stories yet.</p> : posts.map((post, index) => (
            <article className="grid gap-4 py-7 sm:grid-cols-[4rem_1fr_10rem]" key={post.id}>
              <span className="font-mono text-xs text-[var(--ember)]">{String(index + 1).padStart(2, "0")}</span>
              <div><h3 className="theme-display text-3xl leading-none sm:text-5xl"><Link href={`/journal/${post.slug}`}>{post.title}</Link></h3>{post.excerpt && <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">{post.excerpt}</p>}</div>
              <time className="font-mono text-xs uppercase text-[var(--muted)]">{formatDate(post.publishedAt)}</time>
            </article>
          ))}
        </div>
      </section>
    </ThemeFrame>
  );
}
