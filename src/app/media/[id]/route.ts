import { getDb } from "@/lib/db/client";
import { getMediaById } from "@/lib/media/repository";
import { readMediaFile } from "@/lib/media/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = await getMediaById(getDb(), id);
  if (!media) return new Response("Not found", { status: 404 });

  try {
    const file = await readMediaFile(media.storageKey);
    return new Response(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(file.length),
        "Content-Type": media.mimeType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
