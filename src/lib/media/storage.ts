import fs from "node:fs/promises";
import path from "node:path";

function getMediaDirectory() {
  const configuredPath = process.env.MEDIA_DIR;
  return configuredPath
    ? path.resolve(/* turbopackIgnore: true */ process.cwd(), configuredPath)
    : path.join(process.cwd(), "data", "media");
}

function safeStorageKey(storageKey: string) {
  if (!/^[a-f0-9-]+\.webp$/.test(storageKey)) {
    throw new Error("Invalid media storage key.");
  }
  return storageKey;
}

function mediaPath(storageKey: string) {
  return path.join(getMediaDirectory(), safeStorageKey(storageKey));
}

export async function getMediaStorageStats() {
  try {
    await fs.mkdir(getMediaDirectory(), { recursive: true });
    const files = await fs.readdir(getMediaDirectory());
    let bytes = 0;
    for (const file of files) {
      if (!/^[a-f0-9-]+\.webp$/.test(file)) continue;
      bytes += (await fs.stat(path.join(getMediaDirectory(), file))).size;
    }
    return { status: "ok" as const, files: files.length, bytes };
  } catch {
    return { status: "error" as const, files: 0, bytes: 0 };
  }
}

export async function storeMediaFile(storageKey: string, buffer: Buffer) {
  await fs.mkdir(getMediaDirectory(), { recursive: true });
  await fs.writeFile(mediaPath(storageKey), buffer, { flag: "wx" });
}

export async function readMediaFile(storageKey: string) {
  return fs.readFile(mediaPath(storageKey));
}

export async function removeMediaFile(storageKey: string) {
  await fs.rm(mediaPath(storageKey), { force: true });
}
