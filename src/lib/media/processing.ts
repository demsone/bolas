import { createHash } from "node:crypto";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 4000;

const allowedFormats = new Set(["jpeg", "png", "webp"]);

export class MediaValidationError extends Error {}

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: "image/webp";
  size: number;
  width: number;
  height: number;
  sha256: string;
};

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  if (input.length === 0) throw new MediaValidationError("Choose an image to upload.");
  if (input.length > MAX_IMAGE_BYTES) throw new MediaValidationError("Images must be 10 MB or smaller.");

  try {
    const source = sharp(input, {
      failOn: "warning",
      limitInputPixels: 40_000_000,
      sequentialRead: true,
    });
    const metadata = await source.metadata();
    if (!metadata.format || !allowedFormats.has(metadata.format)) {
      throw new MediaValidationError("Use a JPEG, PNG, or WebP image.");
    }

    const { data, info } = await source
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      mimeType: "image/webp",
      size: data.length,
      width: info.width,
      height: info.height,
      sha256: createHash("sha256").update(data).digest("hex"),
    };
  } catch (error) {
    if (error instanceof MediaValidationError) throw error;
    throw new MediaValidationError("Bolas could not read that image. Try another JPEG, PNG, or WebP file.");
  }
}
