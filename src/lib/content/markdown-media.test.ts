import { describe, expect, it } from "vitest";
import { mediaToMarkdown, parseContentMediaLine } from "./markdown-media";

const media = {
  id: "8f2cbd8a-c538-4c9b-b991-691321d72e1f",
  originalName: "hearth.jpg",
  altText: "A shelf [by the fire]",
  caption: 'The "Hearth" shelf & tools',
  width: 1200,
  height: 800,
};

describe("content media Markdown", () => {
  it("round-trips a Hearth media reference without losing accessible text", () => {
    const markdown = mediaToMarkdown(media);
    expect(markdown).toBe('![A shelf [by the fire\\]](/media/8f2cbd8a-c538-4c9b-b991-691321d72e1f "The &quot;Hearth&quot; shelf &amp; tools")');
    expect(parseContentMediaLine(markdown)).toMatchObject({
      id: media.id,
      altText: media.altText,
      caption: media.caption,
      src: `/media/${media.id}`,
    });
  });

  it("rejects arbitrary image paths", () => {
    expect(parseContentMediaLine("![Remote](https://example.com/image.jpg)")).toBeNull();
  });
});
