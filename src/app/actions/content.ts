"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCapability } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import {
  createContentRecord,
  getContentById,
  restoreRevisionRecord,
  slugIsTaken,
  taxonomyTermsExist,
  updateContentRecord,
} from "@/lib/content/repository";
import { isReservedSlug, slugify } from "@/lib/content/slug";
import type { ContentInput } from "@/lib/content/types";
import { getMediaById } from "@/lib/media/repository";

export type ContentActionState = { error?: string };

const contentSchema = z.object({
  kind: z.enum(["page", "post"]),
  state: z.enum(["draft", "published", "archived"]),
  title: z.string().trim().min(1, "Add a title.").max(180),
  slug: z.string().trim().max(100),
  excerpt: z.string().trim().max(500, "Keep the excerpt under 500 characters."),
  seoTitle: z.string().trim().max(180, "Keep the SEO title under 180 characters."),
  seoDescription: z.string().trim().max(300, "Keep the SEO description under 300 characters."),
  canonicalUrl: z.string().trim().max(300),
  noIndex: z.boolean(),
  body: z.string().max(250_000, "This item is too large."),
  featuredMediaId: z.union([z.uuid(), z.literal("")]),
  layout: z.enum(["article", "scrollytelling"]),
  heroMediaId: z.union([z.uuid(), z.literal("")]),
  termIds: z.array(z.uuid()).max(50, "Choose no more than 50 categories and tags."),
});

function parseContent(formData: FormData): { data?: ContentInput; error?: string } {
  const parsed = contentSchema.safeParse({
    kind: formData.get("kind"),
    state: formData.get("state"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    canonicalUrl: formData.get("canonicalUrl") ?? "",
    noIndex: formData.get("noIndex") === "on",
    body: formData.get("body") ?? "",
    featuredMediaId: formData.get("featuredMediaId") ?? "",
    layout: formData.get("layout") ?? "article",
    heroMediaId: formData.get("heroMediaId") ?? "",
    termIds: formData.getAll("termIds"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the content and try again." };

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug) return { error: "Add a usable title or web address." };
  if (isReservedSlug(slug)) return { error: `"${slug}" is reserved by Bolas. Choose another web address.` };

  return { data: { ...parsed.data, slug, excerpt: parsed.data.excerpt || null, seoTitle: parsed.data.seoTitle || null, seoDescription: parsed.data.seoDescription || null, canonicalUrl: parsed.data.canonicalUrl || null, featuredMediaId: parsed.data.featuredMediaId || null, heroMediaId: parsed.data.heroMediaId || null } };
}

async function mediaSelectionExists(input: ContentInput) {
  const mediaIds = [input.featuredMediaId, input.heroMediaId].filter(Boolean) as string[];
  const uniqueMediaIds = [...new Set(mediaIds)];
  if (uniqueMediaIds.length === 0) return true;
  const found = await Promise.all(uniqueMediaIds.map((id) => getMediaById(getDb(), id)));
  return found.every(Boolean);
}

async function taxonomySelectionExists(input: ContentInput) {
  return taxonomyTermsExist(getDb(), input.termIds);
}

async function recordAudit(actorId: string, action: string, subjectId: string) {
  await getDb().insert(auditEvents).values({ id: randomUUID(), actorId, action, subjectType: "content", subjectId, createdAt: new Date() });
}

function revalidateContent(kind: string, slug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath(kind === "post" ? `/journal/${slug}` : `/${slug}`);
  if (kind === "post") revalidatePath("/journal");
}

export async function createContent(_: ContentActionState, formData: FormData): Promise<ContentActionState> {
  const user = await requireCapability("manage_content");
  const parsed = parseContent(formData);
  if (!parsed.data) return { error: parsed.error };
  if (!(await mediaSelectionExists(parsed.data))) return { error: "Choose an image that still exists in the media library." };
  if (!(await taxonomySelectionExists(parsed.data))) return { error: "One of the selected categories or tags no longer exists." };
  if (await slugIsTaken(getDb(), parsed.data.slug)) return { error: "That web address is already in use." };

  const id = await createContentRecord(getDb(), parsed.data, user.id);
  await recordAudit(user.id, `content.${parsed.data.state}`, id);
  revalidateContent(parsed.data.kind, parsed.data.slug);
  redirect(`/admin/content/${id}`);
}

export async function updateContent(id: string, _: ContentActionState, formData: FormData): Promise<ContentActionState> {
  const user = await requireCapability("manage_content");
  const current = await getContentById(getDb(), id);
  if (!current) return { error: "This content item no longer exists." };

  const parsed = parseContent(formData);
  if (!parsed.data) return { error: parsed.error };
  if (!(await mediaSelectionExists(parsed.data))) return { error: "Choose an image that still exists in the media library." };
  if (!(await taxonomySelectionExists(parsed.data))) return { error: "One of the selected categories or tags no longer exists." };
  if (await slugIsTaken(getDb(), parsed.data.slug, id)) return { error: "That web address is already in use." };

  await updateContentRecord(getDb(), id, parsed.data, user.id);
  await recordAudit(user.id, `content.${parsed.data.state}`, id);
  revalidateContent(current.kind, current.slug);
  revalidateContent(parsed.data.kind, parsed.data.slug);
  redirect(`/admin/content/${id}?saved=1`);
}

export async function restoreRevision(contentId: string, revisionId: string) {
  const user = await requireCapability("manage_content");
  const content = await getContentById(getDb(), contentId);
  if (!content || !(await restoreRevisionRecord(getDb(), contentId, revisionId, user.id))) redirect("/admin/content");
  await recordAudit(user.id, "content.revision_restored", contentId);
  revalidateContent(content.kind, content.slug);
  redirect(`/admin/content/${contentId}?restored=1`);
}
