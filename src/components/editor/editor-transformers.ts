import { $createHorizontalRuleNode, $isHorizontalRuleNode, HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { TRANSFORMERS, type ElementTransformer, type Transformer } from "@lexical/markdown";
import { CONTENT_MEDIA_LINE_REGEXP, mediaToMarkdown, parseContentMediaLine } from "@/lib/content/markdown-media";
import { $createContentImageNode, $isContentImageNode, ContentImageNode } from "./content-image-node";

const CONTENT_IMAGE: ElementTransformer = {
  dependencies: [ContentImageNode],
  export: (node) => {
    if (!$isContentImageNode(node)) return null;
    return mediaToMarkdown({
      id: node.__src.replace("/media/", ""),
      originalName: "",
      altText: node.__altText,
      caption: node.__caption,
      width: node.__width,
      height: node.__height,
    });
  },
  regExp: CONTENT_MEDIA_LINE_REGEXP,
  replace: (parentNode, _children, match) => {
    const media = parseContentMediaLine(match[0]);
    if (!media) return false;
    parentNode.replace($createContentImageNode(media));
  },
  type: "element",
};

const HORIZONTAL_RULE: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? "---" : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode) => {
    parentNode.replace($createHorizontalRuleNode());
  },
  type: "element",
};

export const EDITOR_TRANSFORMERS: Transformer[] = [CONTENT_IMAGE, HORIZONTAL_RULE, ...TRANSFORMERS];
