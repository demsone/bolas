"use client";

import { useMemo } from "react";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import type { LexicalEditor } from "lexical";
import { ContentImageNode } from "./content-image-node";
import { $importHearthMarkdown } from "./editor-markdown";
import { EditorStatePlugin } from "./editor-state-plugin";
import { EDITOR_TRANSFORMERS } from "./editor-transformers";
import { EditorToolbar } from "./editor-toolbar";

const EDITOR_THEME = {
  code: "editor-code-block",
  heading: { h2: "editor-heading editor-heading-h2", h3: "editor-heading editor-heading-h3" },
  image: "editor-image-node",
  link: "editor-link",
  list: { listitem: "editor-list-item", nested: { listitem: "editor-list-item-nested" }, ol: "editor-list editor-list-ordered", ul: "editor-list editor-list-unordered" },
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  text: { bold: "font-semibold", code: "editor-inline-code", italic: "italic", strikethrough: "line-through" },
};

type VisualEditorProps = {
  initialMarkdown: string;
  onChange: (markdown: string, plainText: string) => void;
  onOpenMedia: () => void;
  onReady: (editor: LexicalEditor | null) => void;
};

function validLink(value: string) {
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value.trim());
}

export function VisualEditor({ initialMarkdown, onChange, onOpenMedia, onReady }: VisualEditorProps) {
  const initialConfig = useMemo(() => ({
    namespace: "HearthContentEditor",
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode, HorizontalRuleNode, ContentImageNode],
    onError(error: Error) {
      throw error;
    },
    editorState: () => $importHearthMarkdown(initialMarkdown),
    theme: EDITOR_THEME,
  }), [initialMarkdown]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorToolbar onOpenMedia={onOpenMedia} />
      <div className="content-editor-canvas">
        <RichTextPlugin
          ErrorBoundary={LexicalErrorBoundary}
          contentEditable={<ContentEditable aria-label="Content editor" className="content-editor-surface" />}
          placeholder={<p className="content-editor-placeholder">Start writing…</p>}
        />
      </div>
      <HistoryPlugin />
      <HorizontalRulePlugin />
      <LinkPlugin attributes={{ rel: "noopener noreferrer" }} validateUrl={validLink} />
      <ListPlugin />
      <MarkdownShortcutPlugin transformers={EDITOR_TRANSFORMERS} />
      <EditorStatePlugin onChange={onChange} onReady={onReady} />
    </LexicalComposer>
  );
}
