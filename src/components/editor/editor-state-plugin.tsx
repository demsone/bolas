"use client";

import { useEffect } from "react";
import { $convertToMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, type EditorState, type LexicalEditor } from "lexical";
import { EDITOR_TRANSFORMERS } from "./editor-transformers";

type EditorStatePluginProps = {
  onChange: (markdown: string, plainText: string) => void;
  onReady: (editor: LexicalEditor | null) => void;
};

export function EditorStatePlugin({ onChange, onReady }: EditorStatePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    onReady(editor);
    return () => onReady(null);
  }, [editor, onReady]);

  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      onChange($convertToMarkdownString(EDITOR_TRANSFORMERS), $getRoot().getTextContent());
    });
  }

  return <OnChangePlugin ignoreSelectionChange onChange={handleChange} />;
}
