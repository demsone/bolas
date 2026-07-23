import type { EditorMedia } from "@/lib/media/types";

const MEDIA_ID = "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

export const CONTENT_MEDIA_LINE_REGEXP = new RegExp(
  `^!\\[((?:\\\\.|[^\\]])*)\\]\\((\\/media\\/(${MEDIA_ID}))(?:\\s+\"((?:&(?:amp|quot);|[^\"])*)\")?\\)$`,
  "i",
);

function encodeText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("]", "\\]");
}

function decodeText(value: string) {
  return value.replaceAll("\\]", "]").replaceAll("\\\\", "\\");
}

function encodeCaption(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function decodeCaption(value: string) {
  return value.replaceAll("&quot;", '"').replaceAll("&amp;", "&");
}

export function mediaToMarkdown(media: EditorMedia) {
  const caption = media.caption ? ` "${encodeCaption(media.caption)}"` : "";
  return `![${encodeText(media.altText)}](/media/${media.id}${caption})`;
}

export function parseContentMediaLine(line: string): (EditorMedia & { src: string }) | null {
  const match = line.trim().match(CONTENT_MEDIA_LINE_REGEXP);
  if (!match) return null;
  return {
    id: match[3],
    src: match[2],
    originalName: "",
    altText: decodeText(match[1]),
    caption: match[4] ? decodeCaption(match[4]) : null,
    width: 1600,
    height: 900,
  };
}
