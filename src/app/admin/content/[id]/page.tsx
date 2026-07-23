import Link from "next/link";
import { notFound } from "next/navigation";
import { restoreRevision, updateContent } from "@/app/actions/content";
import { ContentForm } from "@/components/content-form";
import { getDb } from "@/lib/db/client";
import { getContentById, listRevisions, listTaxonomyTerms, listTermsForContent } from "@/lib/content/repository";
import { listMedia } from "@/lib/media/repository";

function formatDate(date: Date) { return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(date); }

export default async function EditContentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; restored?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const item = await getContentById(getDb(), id);
  if (!item) notFound();
  const revisions = await listRevisions(getDb(), id);
  const media = await listMedia(getDb());
  const terms = await listTaxonomyTerms(getDb());
  const selectedTermIds = (await listTermsForContent(getDb(), id)).map((term) => term.id);
  const updateAction = updateContent.bind(null, id);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-7"><div><Link className="text-sm text-[var(--muted)] hover:text-[var(--ink)]" href="/admin/content">← Content</Link><h1 className="admin-title mt-4">Edit {item.kind}</h1></div>{item.state === "published" && <Link className="hearth-button-secondary no-underline" href={item.kind === "post" ? `/journal/${item.slug}` : `/${item.slug}`} target="_blank">View live ↗</Link>}</header>
      {(query.saved || query.restored) && <p className="mt-6 border-l-2 border-[#397357] bg-[#e6f2eb] px-3 py-2 text-sm">{query.restored ? "Revision restored." : "Changes saved."}</p>}
      <ContentForm action={updateAction} initial={{ kind: item.kind, state: item.state, title: item.title, slug: item.slug, excerpt: item.excerpt, seoTitle: item.seoTitle, seoDescription: item.seoDescription, canonicalUrl: item.canonicalUrl, noIndex: item.noIndex, body: item.body, featuredMediaId: item.featuredMediaId, layout: item.layout, heroMediaId: item.heroMediaId, termIds: selectedTermIds }} media={media} terms={terms} />
      <section className="mt-10 border-t border-[var(--line)] pt-8"><h2 className="text-lg font-semibold">Revision history</h2><p className="mt-2 text-sm text-[var(--muted)]">Each save keeps the version that came before it.</p>{revisions.length === 0 ? <p className="mt-5 text-sm text-[var(--muted)]">No earlier versions yet.</p> : <div className="mt-5 divide-y divide-[var(--line)] border-y border-[var(--line)]">{revisions.map((revision) => { const action = restoreRevision.bind(null, id, revision.id); return <div className="flex flex-wrap items-center justify-between gap-4 py-4" key={revision.id}><div><p className="font-medium">{revision.title}</p><p className="mt-1 text-xs text-[var(--muted)]">Saved {formatDate(revision.createdAt)}</p></div><form action={action}><button className="hearth-button-secondary" type="submit">Restore</button></form></div>; })}</div>}</section>
    </>
  );
}
