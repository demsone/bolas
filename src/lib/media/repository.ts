import { randomUUID } from "node:crypto";
import { desc, eq, like, or } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { mediaAssets } from "@/lib/db/schema";

type Database = ReturnType<typeof getDb>;

export type NewMediaRecord = {
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  sha256: string;
  uploadedById: string;
  altText?: string;
  caption?: string | null;
};

export async function createMediaRecord(db: Database, input: NewMediaRecord) {
  const id = randomUUID();
  const now = new Date();
  await db.insert(mediaAssets).values({
    id,
    ...input,
    altText: input.altText ?? "",
    caption: input.caption ?? null,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function getMediaById(db: Database, id: string) {
  const [media] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return media;
}

export async function listMedia(db: Database, search = "") {
  const query = search.trim();
  if (!query) return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
  const pattern = `%${query}%`;
  return db
    .select()
    .from(mediaAssets)
    .where(or(like(mediaAssets.originalName, pattern), like(mediaAssets.altText, pattern), like(mediaAssets.caption, pattern)))
    .orderBy(desc(mediaAssets.createdAt));
}

export async function updateMediaMetadata(db: Database, id: string, altText: string, caption: string | null) {
  const updated = await db.update(mediaAssets).set({ altText, caption, updatedAt: new Date() }).where(eq(mediaAssets.id, id)).returning({ id: mediaAssets.id });
  return updated.length > 0;
}
