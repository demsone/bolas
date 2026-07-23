import { createTaxonomyTerm, deleteTaxonomyTerm } from "@/app/actions/organization";
import { getDb } from "@/lib/db/client";
import { listTaxonomyTerms } from "@/lib/content/repository";
import type { TaxonomyKind } from "@/lib/content/types";

type TaxonomyTerms = Awaited<ReturnType<typeof listTaxonomyTerms>>;

function TermColumn({ kind, terms }: { kind: TaxonomyKind; terms: TaxonomyTerms }) {
  const singular = kind === "category" ? "Category" : "Tag";
  return (
    <section className="organization-column">
      <header>
        <p className="eyebrow">{kind === "category" ? "Editorial shelves" : "Useful signals"}</p>
        <h2>{kind === "category" ? "Categories" : "Tags"}</h2>
        <p>{kind === "category" ? "Broad sections for grouping posts." : "Specific topics readers can follow."}</p>
      </header>
      <form action={createTaxonomyTerm} className="organization-create-form">
        <input name="kind" type="hidden" value={kind} />
        <label className="content-label">{singular} name<input className="hearth-input" maxLength={80} name="name" placeholder={kind === "category" ? "Field notes" : "Melbourne"} required /></label>
        <button className="hearth-button" type="submit">Create {kind}</button>
      </form>
      <div className="organization-list">
        {terms.length === 0 ? <p className="organization-empty">No {kind === "category" ? "categories" : "tags"} yet.</p> : terms.map((term) => {
          const action = deleteTaxonomyTerm.bind(null, term.id);
          return (
            <div className="organization-row" key={term.id}>
              <div><strong>{term.name}</strong><small>/{term.slug}</small></div>
              <form action={action}><button type="submit">Remove</button></form>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function TaxonomyPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const query = await searchParams;
  const categories = await listTaxonomyTerms(getDb(), "category");
  const tags = await listTaxonomyTerms(getDb(), "tag");
  return (
    <>
      <header className="border-b border-[var(--line)] pb-7">
        <p className="eyebrow">Content organisation</p>
        <h1 className="admin-title">Categories & tags</h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-[var(--muted)]">Keep the structure light: categories group the journal, while tags describe the details.</p>
      </header>
      {(query.error || query.saved) && <p className={`management-notice ${query.error ? "is-error" : "is-saved"}`}>{query.error ?? query.saved}</p>}
      <div className="organization-grid">
        <TermColumn kind="category" terms={categories} />
        <TermColumn kind="tag" terms={tags} />
      </div>
    </>
  );
}
