"use client";

import { useCallback, useRef, useState } from "react";
import { $insertNodes, type LexicalEditor } from "lexical";
import type { EditorMedia } from "@/lib/media/types";
import { $createContentImageNode } from "./content-image-node";
import { MediaShelf } from "./media-shelf";
import { VisualEditor } from "./visual-editor";

type RichTextEditorProps = {
  initialMarkdown: string;
  media: EditorMedia[];
};

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function RichTextEditor({
  initialMarkdown,
  media: initialMedia,
}: RichTextEditorProps) {
  const editor = useRef<LexicalEditor | null>(null);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [media, setMedia] = useState(initialMedia);
  const [mode, setMode] = useState<"visual" | "markdown">("visual");
  const [openMedia, setOpenMedia] = useState(false);
  const [visualKey, setVisualKey] = useState(0);
  const [wordCount, setWordCount] = useState(countWords(initialMarkdown.replace(/[#*_>`~[\]()!-]/g, " ")));

  const handleReady = useCallback((nextEditor: LexicalEditor | null) => {
    editor.current = nextEditor;
  }, []);

  const handleEditorChange = useCallback((nextMarkdown: string, plainText: string) => {
    setMarkdown(nextMarkdown);
    setWordCount(countWords(plainText));
  }, []);

  function showVisualEditor() {
    setVisualKey((value) => value + 1);
    setWordCount(countWords(markdown.replace(/[#*_>`~[\]()!-]/g, " ")));
    setMode("visual");
  }

  function insertMedia(item: EditorMedia) {
    const activeEditor = editor.current;
    if (!activeEditor) return;
    activeEditor.update(() => {
      $insertNodes([$createContentImageNode({
        altText: item.altText,
        caption: item.caption,
        height: item.height,
        src: `/media/${item.id}`,
        width: item.width,
      })]);
    });
    setOpenMedia(false);
  }

  function addUploadedMedia(item: EditorMedia) {
    setMedia((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
    insertMedia(item);
  }

  return (
    <div className="content-editor">
      <input name="body" type="hidden" value={markdown} />
      <div className="content-editor-topline">
        <div><span className="editor-live-dot" />Writing canvas <small>{wordCount} {wordCount === 1 ? "word" : "words"}</small></div>
        <div aria-label="Editor mode" className="editor-mode-switch" role="group">
          <button aria-pressed={mode === "visual"} className={mode === "visual" ? "is-active" : ""} onClick={showVisualEditor} type="button">Visual</button>
          <button aria-pressed={mode === "markdown"} className={mode === "markdown" ? "is-active" : ""} onClick={() => setMode("markdown")} type="button">Markdown</button>
        </div>
      </div>
      {mode === "visual" ? (
        <VisualEditor
          initialMarkdown={markdown}
          key={visualKey}
          onChange={handleEditorChange}
          onOpenMedia={() => setOpenMedia(true)}
          onReady={handleReady}
        />
      ) : (
        <div className="content-editor-source">
          <div><strong>Portable source</strong><span>Every change here returns to the visual editor.</span></div>
          <textarea aria-label="Content Markdown source" onChange={(event) => setMarkdown(event.target.value)} spellCheck value={markdown} />
        </div>
      )}
      <MediaShelf media={media} onClose={() => setOpenMedia(false)} onInsert={insertMedia} onUploaded={addUploadedMedia} open={openMedia} />
    </div>
  );
}
