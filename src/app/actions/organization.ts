"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCapability } from "@/lib/auth/session";
import {
  createTaxonomyTermRecord,
  deleteTaxonomyTermRecord,
  taxonomySlugIsTaken,
} from "@/lib/content/repository";
import { slugify } from "@/lib/content/slug";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";

const termSchema = z.object({
  kind: z.enum(["category", "tag"]),
  name: z.string().trim().min(1).max(80),
});

function managementRedirect(path: string, message: string, kind: "error" | "saved" = "error"): never {
  redirect(`${path}?${kind}=${encodeURIComponent(message)}`);
}

async function recordAudit(actorId: string, action: string, subjectType: string, subjectId: string | null) {
  await getDb().insert(auditEvents).values({
    id: randomUUID(),
    actorId,
    action,
    subjectType,
    subjectId,
    createdAt: new Date(),
  });
}

export async function createTaxonomyTerm(formData: FormData) {
  const user = await requireCapability("manage_content");
  const parsed = termSchema.safeParse({ kind: formData.get("kind"), name: formData.get("name") });
  if (!parsed.success) managementRedirect("/admin/taxonomy", "Add a category or tag name.");
  const slug = slugify(parsed.data.name);
  if (!slug) managementRedirect("/admin/taxonomy", "Use a name that can form a web address.");
  if (await taxonomySlugIsTaken(getDb(), parsed.data.kind, slug)) {
    managementRedirect("/admin/taxonomy", `That ${parsed.data.kind} already exists.`);
  }
  const id = await createTaxonomyTermRecord(getDb(), parsed.data.kind, parsed.data.name, slug);
  await recordAudit(user.id, "taxonomy.created", "taxonomy", id);
  revalidatePath("/admin/taxonomy");
  managementRedirect("/admin/taxonomy", `${parsed.data.kind === "tag" ? "Tag" : "Category"} created.`, "saved");
}

export async function deleteTaxonomyTerm(id: string) {
  const user = await requireCapability("manage_content");
  if (await deleteTaxonomyTermRecord(getDb(), id)) await recordAudit(user.id, "taxonomy.deleted", "taxonomy", id);
  revalidatePath("/admin/taxonomy");
  revalidatePath("/journal");
}
