import { notFound } from "next/navigation";
import { listPublishedPostsByTerm, listTaxonomyTerms } from "@/lib/content/repository";
import type { TaxonomyKind } from "@/lib/content/types";
import { getDb } from "@/lib/db/client";
import { getActiveTheme } from "@/lib/themes/runtime";

export async function TaxonomyArchive({ kind, slug }: { kind: TaxonomyKind; slug: string }) {
  const term = (await listTaxonomyTerms(getDb(), kind)).find((item) => item.slug === slug);
  if (!term) notFound();
  const posts = await listPublishedPostsByTerm(getDb(), kind, slug);
  const theme = getActiveTheme();
  const JournalTemplate = theme.templates.Journal;
  return <JournalTemplate description={kind === "category" ? "Posts filed in this category." : "Posts carrying this tag."} eyebrow={kind} manifest={theme.manifest} posts={posts} title={term.name} />;
}
