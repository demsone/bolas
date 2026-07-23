import { $generateNodesFromMarkdownString } from "@lexical/markdown";
import { $createParagraphNode, $getRoot } from "lexical";
import { parseContentMediaLine } from "@/lib/content/markdown-media";
import { $createContentImageNode } from "./content-image-node";
import { EDITOR_TRANSFORMERS } from "./editor-transformers";

export function $importHearthMarkdown(markdown: string) {
  const root = $getRoot();
  const textLines: string[] = [];

  function flushText() {
    if (textLines.length === 0) return;
    root.append(
      ...$generateNodesFromMarkdownString(
        textLines.join("\n"),
        EDITOR_TRANSFORMERS,
      ),
    );
    textLines.length = 0;
  }

  for (const line of markdown.split("\n")) {
    const media = parseContentMediaLine(line);
    if (!media) {
      textLines.push(line);
      continue;
    }
    flushText();
    root.append($createContentImageNode(media));
  }
  flushText();

  if (root.isEmpty()) root.append($createParagraphNode());
}
