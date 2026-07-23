import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { contentItems, contentRevisions, contentTaxonomyTerms, taxonomyTerms } from "@/lib/db/schema";
import type { ContentInput, ContentKind, TaxonomyKind } from "./types";

type Database = ReturnType<typeof getDb>;

export async function createContentRecord(db: Database, input: ContentInput, authorId: string) {
  return db.transaction(async (tx) => {
    const now = new Date();
    const id = randomUUID();
    const { termIds, ...content } = input;
    await tx.insert(contentItems).values({
      id,
      ...content,
      authorId,
      publishedAt: input.state === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    });
    if (termIds.length > 0) {
      await tx.insert(contentTaxonomyTerms).values(termIds.map((termId) => ({ contentItemId: id, termId })));
    }
    return id;
  });
}

export async function updateContentRecord(db: Database, id: string, input: ContentInput, userId: string) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(contentItems).where(eq(contentItems.id, id)).limit(1);
    if (!current) return false;

    await tx.insert(contentRevisions).values({
      id: randomUUID(),
      contentItemId: current.id,
      title: current.title,
      excerpt: current.excerpt,
      seoTitle: current.seoTitle,
      seoDescription: current.seoDescription,
      canonicalUrl: current.canonicalUrl,
      noIndex: current.noIndex,
      body: current.body,
      featuredMediaId: current.featuredMediaId,
      layout: current.layout,
      heroMediaId: current.heroMediaId,
      savedById: userId,
      createdAt: new Date(),
    });

    const { termIds, ...content } = input;
    await tx.update(contentItems).set({
      ...content,
      publishedAt: input.state === "published" ? current.publishedAt ?? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(contentItems.id, id));
    await tx.delete(contentTaxonomyTerms).where(eq(contentTaxonomyTerms.contentItemId, id));
    if (termIds.length > 0) {
      await tx.insert(contentTaxonomyTerms).values(termIds.map((termId) => ({ contentItemId: id, termId })));
    }
    return true;
  });
}

export async function restoreRevisionRecord(db: Database, contentId: string, revisionId: string, userId: string) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(contentItems).where(eq(contentItems.id, contentId)).limit(1);
    const [revision] = await tx.select().from(contentRevisions).where(and(eq(contentRevisions.id, revisionId), eq(contentRevisions.contentItemId, contentId))).limit(1);
    if (!current || !revision) return false;

    await tx.insert(contentRevisions).values({
      id: randomUUID(),
      contentItemId: current.id,
      title: current.title,
      excerpt: current.excerpt,
      body: current.body,
      featuredMediaId: current.featuredMediaId,
      layout: current.layout,
      heroMediaId: current.heroMediaId,
      savedById: userId,
      createdAt: new Date(),
    });

    await tx.update(contentItems).set({
      title: revision.title,
      excerpt: revision.excerpt,
      seoTitle: revision.seoTitle,
      seoDescription: revision.seoDescription,
      canonicalUrl: revision.canonicalUrl,
      noIndex: revision.noIndex,
      body: revision.body,
      featuredMediaId: revision.featuredMediaId,
      layout: revision.layout,
      heroMediaId: revision.heroMediaId,
      updatedAt: new Date(),
    }).where(eq(contentItems.id, contentId));
    return true;
  });
}

export async function listContent(db: Database, kind?: ContentKind) {
  const query = db.select().from(contentItems);
  return kind
    ? await query.where(eq(contentItems.kind, kind)).orderBy(desc(contentItems.updatedAt))
    : await query.orderBy(desc(contentItems.updatedAt));
}

export async function getContentById(db: Database, id: string) {
  const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id)).limit(1);
  return item;
}

export async function listRevisions(db: Database, contentId: string) {
  return db.select().from(contentRevisions).where(eq(contentRevisions.contentItemId, contentId)).orderBy(desc(contentRevisions.createdAt));
}

export async function getPublishedBySlug(db: Database, kind: ContentKind, slug: string) {
  const [item] = await db.select().from(contentItems).where(and(eq(contentItems.kind, kind), eq(contentItems.slug, slug), eq(contentItems.state, "published"))).limit(1);
  return item;
}

export async function listPublishedPosts(db: Database, limit?: number) {
  const query = db.select().from(contentItems).where(and(eq(contentItems.kind, "post"), eq(contentItems.state, "published"))).orderBy(desc(contentItems.publishedAt));
  return limit ? await query.limit(limit) : await query;
}

export async function listTaxonomyTerms(db: Database, kind?: TaxonomyKind) {
  const query = db.select().from(taxonomyTerms);
  return kind
    ? await query.where(eq(taxonomyTerms.kind, kind)).orderBy(asc(taxonomyTerms.name))
    : await query.orderBy(asc(taxonomyTerms.kind), asc(taxonomyTerms.name));
}

export async function listTermsForContent(db: Database, contentItemId: string) {
  return db
    .select({
      id: taxonomyTerms.id,
      kind: taxonomyTerms.kind,
      name: taxonomyTerms.name,
      slug: taxonomyTerms.slug,
    })
    .from(contentTaxonomyTerms)
    .innerJoin(taxonomyTerms, eq(contentTaxonomyTerms.termId, taxonomyTerms.id))
    .where(eq(contentTaxonomyTerms.contentItemId, contentItemId))
    .orderBy(asc(taxonomyTerms.kind), asc(taxonomyTerms.name));
}

export async function taxonomyTermsExist(db: Database, ids: string[]) {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return true;
  return (await db.select({ id: taxonomyTerms.id }).from(taxonomyTerms).where(inArray(taxonomyTerms.id, uniqueIds))).length === uniqueIds.length;
}

export async function createTaxonomyTermRecord(db: Database, kind: TaxonomyKind, name: string, slug: string) {
  const now = new Date();
  const id = randomUUID();
  await db.insert(taxonomyTerms).values({ id, kind, name, slug, createdAt: now, updatedAt: now });
  return id;
}

export async function deleteTaxonomyTermRecord(db: Database, id: string) {
  const deleted = await db.delete(taxonomyTerms).where(eq(taxonomyTerms.id, id)).returning({ id: taxonomyTerms.id });
  return deleted.length > 0;
}

export async function taxonomySlugIsTaken(db: Database, kind: TaxonomyKind, slug: string) {
  const [term] = await db.select({ id: taxonomyTerms.id }).from(taxonomyTerms).where(and(eq(taxonomyTerms.kind, kind), eq(taxonomyTerms.slug, slug))).limit(1);
  return Boolean(term);
}

export async function listPublishedPostsByTerm(db: Database, kind: TaxonomyKind, slug: string) {
  return db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      title: contentItems.title,
      excerpt: contentItems.excerpt,
      publishedAt: contentItems.publishedAt,
    })
    .from(contentItems)
    .innerJoin(contentTaxonomyTerms, eq(contentItems.id, contentTaxonomyTerms.contentItemId))
    .innerJoin(taxonomyTerms, eq(contentTaxonomyTerms.termId, taxonomyTerms.id))
    .where(and(
      eq(contentItems.kind, "post"),
      eq(contentItems.state, "published"),
      eq(taxonomyTerms.kind, kind),
      eq(taxonomyTerms.slug, slug),
    ))
    .orderBy(desc(contentItems.publishedAt));
}

export async function slugIsTaken(db: Database, slug: string, exceptId?: string) {
  const [existing] = await db.select({ id: contentItems.id }).from(contentItems).where(eq(contentItems.slug, slug)).limit(1);
  return Boolean(existing && existing.id !== exceptId);
}
