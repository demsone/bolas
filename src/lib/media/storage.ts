import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let storageClient: SupabaseClient | null = null;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? "bolas-media";

function getStorageClient() {
  if (!storageClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Supabase storage requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
    storageClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }
  return storageClient;
}

function safeStorageKey(storageKey: string) {
  if (!/^[a-f0-9-]+\.webp$/.test(storageKey)) {
    throw new Error("Invalid media storage key.");
  }
  return storageKey;
}

export async function getMediaStorageStats() {
  const { data, error } = await getStorageClient().storage.from(bucketName).list("", { limit: 1000 });
  if (error) return { status: "error" as const, files: 0, bytes: 0 };
  return {
    status: "ok" as const,
    files: data.length,
    bytes: data.reduce((total, file) => total + (file.metadata?.size ? Number(file.metadata.size) : 0), 0),
  };
}

export async function storeMediaFile(storageKey: string, buffer: Buffer) {
  const { error } = await getStorageClient().storage
    .from(bucketName)
    .upload(safeStorageKey(storageKey), buffer, {
      contentType: "image/webp",
      upsert: false,
    });
  if (error) throw new Error(`Supabase media upload failed: ${error.message}`);
}

export async function readMediaFile(storageKey: string) {
  const { data, error } = await getStorageClient().storage.from(bucketName).download(safeStorageKey(storageKey));
  if (error) throw new Error(`Supabase media download failed: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function removeMediaFile(storageKey: string) {
  await getStorageClient().storage.from(bucketName).remove([safeStorageKey(storageKey)]);
}
