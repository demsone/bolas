import { randomUUID } from "node:crypto";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import { mediaMetadataSchema } from "@/lib/media/metadata";
import { MAX_IMAGE_BYTES, MediaValidationError, processImage } from "@/lib/media/processing";
import { createMediaRecord } from "@/lib/media/repository";
import { removeMediaFile, storeMediaFile } from "@/lib/media/storage";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to upload media." }, { status: 401 });
  if (!can(user.role, "manage_media")) return Response.json({ error: "You do not have permission to upload media." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_IMAGE_BYTES + 1024 * 1024) {
    return Response.json({ error: "Images must be 10 MB or smaller." }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const upload = formData.get("file");
    if (!(upload instanceof File)) return Response.json({ error: "Choose an image to upload." }, { status: 400 });
    const metadata = mediaMetadataSchema.safeParse({
      altText: formData.get("altText") ?? "",
      caption: formData.get("caption") ?? "",
    });
    if (!metadata.success) {
      return Response.json({ error: metadata.error.issues[0]?.message ?? "Check the image details and try again." }, { status: 400 });
    }

    const processed = await processImage(Buffer.from(await upload.arrayBuffer()));
    const storageKey = `${randomUUID()}.webp`;
    await storeMediaFile(storageKey, processed.buffer);

    try {
      const id = await createMediaRecord(getDb(), {
        storageKey,
        originalName: upload.name.slice(0, 255) || "untitled-image",
        mimeType: processed.mimeType,
        size: processed.size,
        width: processed.width,
        height: processed.height,
        sha256: processed.sha256,
        uploadedById: user.id,
        altText: metadata.data.altText,
        caption: metadata.data.caption || null,
      });
      await getDb().insert(auditEvents).values({
        id: randomUUID(),
        actorId: user.id,
        action: "media.uploaded",
        subjectType: "media",
        subjectId: id,
        detail: { originalName: upload.name, width: processed.width, height: processed.height },
        createdAt: new Date(),
      });
      return Response.json({
        id,
        media: {
          id,
          originalName: upload.name.slice(0, 255) || "untitled-image",
          altText: metadata.data.altText,
          caption: metadata.data.caption || null,
          width: processed.width,
          height: processed.height,
        },
      }, { status: 201 });
    } catch (error) {
      await removeMediaFile(storageKey);
      throw error;
    }
  } catch (error) {
    if (error instanceof MediaValidationError) return Response.json({ error: error.message }, { status: 400 });
    console.error("Media upload failed", error);
    return Response.json({ error: "The upload could not be saved." }, { status: 500 });
  }
}
