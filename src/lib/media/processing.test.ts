import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { MediaValidationError, processImage } from "./processing";

describe("media processing", () => {
  it("normalises a valid image to WebP", async () => {
    const source = await sharp({
      create: { width: 120, height: 80, channels: 3, background: "#af4e32" },
    }).png().toBuffer();

    const result = await processImage(source);

    expect(result.mimeType).toBe("image/webp");
    expect(result.width).toBe(120);
    expect(result.height).toBe(80);
    expect(result.size).toBeGreaterThan(0);
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect((await sharp(result.buffer).metadata()).format).toBe("webp");
  });

  it("rejects data that is not a supported image", async () => {
    await expect(processImage(Buffer.from("<svg onload=alert(1)>"))).rejects.toBeInstanceOf(MediaValidationError);
  });
});
