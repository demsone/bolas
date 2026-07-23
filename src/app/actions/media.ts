"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import { mediaMetadataSchema } from "@/lib/media/metadata";
import { updateMediaMetadata } from "@/lib/media/repository";

export type MediaActionState = { error?: string };

export async function updateMedia(id: string, _: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const user = await requireCapability("manage_media");
  const parsed = mediaMetadataSchema.safeParse({
    altText: formData.get("altText") ?? "",
    caption: formData.get("caption") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };

  if (!(await updateMediaMetadata(getDb(), id, parsed.data.altText, parsed.data.caption || null))) {
    return { error: "This image no longer exists." };
  }
  await getDb().insert(auditEvents).values({
    id: randomUUID(),
    actorId: user.id,
    action: "media.updated",
    subjectType: "media",
    subjectId: id,
    createdAt: new Date(),
  });
  revalidatePath("/admin/media");
  revalidatePath(`/admin/media/${id}`);
  redirect(`/admin/media/${id}?saved=1`);
}
