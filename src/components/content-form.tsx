"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ContentActionState } from "@/app/actions/content";
import type { ContentInput, TaxonomyTerm } from "@/lib/content/types";
import type { EditorMedia } from "@/lib/media/types";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

type ContentAction = (state: ContentActionState, formData: FormData) => Promise<ContentActionState>;

export function ContentForm({ action, initial, media, terms }: { action: ContentAction; initial?: Partial<ContentInput>; media: EditorMedia[]; terms: TaxonomyTerm[] }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const selectedTerms = new Set(initial?.termIds ?? []);
  const categories = terms.filter((term) => term.kind === "category");
  const tags = terms.filter((term) => term.kind === "tag");

  return (
    <form action={formAction} className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="space-y-5">
        <label className="content-label">Title<input className="hearth-input" name="title" onChange={(event) => setTitle(event.target.value)} required value={title} /></label>
        <label className="content-label">Web address<input className="hearth-input font-mono text-sm" defaultValue={initial?.slug ?? ""} name="slug" placeholder="created-from-title-if-empty" /></label>
        <label className="content-label">Short excerpt<textarea className="hearth-input min-h-24 resize-y" name="excerpt" onChange={(event) => setExcerpt(event.target.value)} value={excerpt} /></label>
        <details className="border border-[var(--line)] bg-[#f7f8f3] p-4">
          <summary className="cursor-pointer text-sm font-semibold">Search and sharing</summary>
          <div className="mt-5 space-y-4">
            <label className="content-label">SEO title<input className="hearth-input" defaultValue={initial?.seoTitle ?? ""} maxLength={180} name="seoTitle" placeholder="Defaults to the content title" /></label>
            <label className="content-label">SEO description<textarea className="hearth-input min-h-20 resize-y" defaultValue={initial?.seoDescription ?? ""} maxLength={300} name="seoDescription" placeholder="Defaults to the excerpt" /></label>
            <label className="content-label">Canonical URL<input className="hearth-input" defaultValue={initial?.canonicalUrl ?? ""} name="canonicalUrl" placeholder="Optional absolute URL" type="url" /></label>
            <label className="module-toggle-setting"><input defaultChecked={initial?.noIndex ?? false} name="noIndex" type="checkbox" /><span><span className="block font-semibold">Keep out of search indexes</span><span className="mt-1 block font-normal leading-5 text-[var(--muted)]">Use for private, temporary, or intentionally unlisted content.</span></span></label>
          </div>
        </details>
        <section>
          <div className="content-label mb-2">Content <span className="font-normal text-[var(--muted)]">Rich text with portable Markdown underneath</span></div>
          <RichTextEditor
            initialMarkdown={initial?.body ?? ""}
            media={media}
          />
        </section>
      </div>
      <aside className="space-y-5">
        <section className="border border-[var(--line)] bg-white p-4">
          <label className="content-label">Type<select className="hearth-input" defaultValue={initial?.kind ?? "page"} name="kind"><option value="page">Page</option><option value="post">Post</option></select></label>
          <label className="content-label mt-5">Status<select className="hearth-input" defaultValue={initial?.state ?? "draft"} name="state"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          <label className="content-label mt-5">Article layout<select className="hearth-input" defaultValue={initial?.layout ?? "article"} name="layout"><option value="article">Standard article</option><option value="scrollytelling">Scrollytelling</option></select></label>
          <label className="content-label mt-5">Featured image<select className="hearth-input" defaultValue={initial?.featuredMediaId ?? ""} name="featuredMediaId"><option value="">No featured image</option>{media.map((item) => <option key={item.id} value={item.id}>{item.altText || item.originalName}</option>)}</select></label>
          <label className="content-label mt-5">Hero background<select className="hearth-input" defaultValue={initial?.heroMediaId ?? ""} name="heroMediaId"><option value="">Use featured image</option>{media.map((item) => <option key={item.id} value={item.id}>{item.altText || item.originalName}</option>)}</select></label>
          <Link className="mt-3 inline-block text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ember)]" href="/admin/media">Manage media</Link>
        </section>
        <section className="border border-[var(--line)] bg-white p-4">
          <p className="content-label">Organisation</p>
          <div className="mt-4">
            <p className="taxonomy-field-label">Categories</p>
            {categories.length === 0 ? <p className="taxonomy-empty">No categories yet.</p> : (
              <div className="taxonomy-choice-list">
                {categories.map((term) => <label key={term.id}><input defaultChecked={selectedTerms.has(term.id)} name="termIds" type="checkbox" value={term.id} /><span>{term.name}</span></label>)}
              </div>
            )}
          </div>
          <div className="mt-5">
            <p className="taxonomy-field-label">Tags</p>
            {tags.length === 0 ? <p className="taxonomy-empty">No tags yet.</p> : (
              <div className="taxonomy-choice-list">
                {tags.map((term) => <label key={term.id}><input defaultChecked={selectedTerms.has(term.id)} name="termIds" type="checkbox" value={term.id} /><span>{term.name}</span></label>)}
              </div>
            )}
          </div>
          <Link className="mt-4 inline-block text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ember)]" href="/admin/taxonomy">Manage categories and tags</Link>
        </section>
        {state.error && <p aria-live="polite" className="border-l-2 border-[var(--ember)] bg-[#f8e6df] px-3 py-2 text-sm">{state.error}</p>}
        <button className="hearth-button" disabled={pending} type="submit">{pending ? "Saving…" : initial ? "Save changes" : "Create content"}</button>
      </aside>
    </form>
  );
}
