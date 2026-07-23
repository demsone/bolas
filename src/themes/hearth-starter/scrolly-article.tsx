"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MarkdownContent } from "@/components/markdown";
import type { ThemeContent } from "@/lib/themes/contract";

gsap.registerPlugin(ScrollTrigger);

function splitStory(body: string) {
  const sections = body.split(/\n-{3,}\n/g).map((section) => section.trim()).filter(Boolean);
  return sections.length > 0 ? sections : [body];
}

export function ScrollyArticle({ content }: { content: ThemeContent }) {
  const root = useRef<HTMLElement | null>(null);
  const sections = useMemo(() => splitStory(content.body), [content.body]);
  const featured = content.featuredMedia;

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !root.current) return;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".scrolly-step").forEach((step) => {
        gsap.fromTo(step, { opacity: 0.35, y: 36 }, {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: step,
            start: "top 75%",
            end: "top 35%",
            scrub: true,
          },
        });
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <article className="scrolly-article" ref={root}>
      <header className="scrolly-hero">
        {featured && <Image alt={featured.altText} className="absolute inset-0 size-full object-cover" height={featured.height} priority src={`/media/${featured.id}`} unoptimized width={featured.width} />}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-[var(--theme-shell-width)] flex-col justify-end px-5 pb-12 text-white sm:px-9">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-75">Scrollytelling</p>
          <h1 className="theme-display mt-5 max-w-5xl text-6xl leading-[0.9] sm:text-8xl">{content.title}</h1>
          {content.excerpt && <p className="mt-6 max-w-2xl text-xl leading-8 opacity-85">{content.excerpt}</p>}
          {content.terms.length > 0 && <div className="public-taxonomy mt-7">{content.terms.map((term) => <Link href={`/journal/${term.kind}/${term.slug}`} key={term.id}>{term.kind === "tag" ? "#" : ""}{term.name}</Link>)}</div>}
        </div>
      </header>
      <div className="mx-auto max-w-[var(--theme-reading-width)] px-5 py-14 sm:px-9">
        {sections.map((section, index) => (
          <section className="scrolly-step" key={`${index}-${section.slice(0, 24)}`}>
            <MarkdownContent>{section}</MarkdownContent>
          </section>
        ))}
      </div>
    </article>
  );
}
