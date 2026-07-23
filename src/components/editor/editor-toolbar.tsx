"use client";

import { useEffect, useState } from "react";
import { TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode, type HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { ToolbarButton } from "./toolbar-button";

type BlockType = "paragraph" | "h2" | "h3" | "quote" | "bullet" | "number";

function validLink(value: string) {
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value.trim());
}

export function EditorToolbar({ onOpenMedia }: { onOpenMedia: () => void }) {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<BlockType>("paragraph");
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [formats, setFormats] = useState({ bold: false, italic: false, strike: false, code: false, link: false });

  useEffect(() => mergeRegister(
    editor.registerCommand(CAN_UNDO_COMMAND, (value) => { setCanUndo(value); return false; }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(CAN_REDO_COMMAND, (value) => { setCanRedo(value); return false; }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const anchor = selection.anchor.getNode();
        const element = anchor.getKey() === "root" ? anchor : anchor.getTopLevelElementOrThrow();
        if ($isHeadingNode(element)) setBlockType(element.getTag() as BlockType);
        else if ($isQuoteNode(element)) setBlockType("quote");
        else if ($isListNode(element)) setBlockType(element.getListType() === "number" ? "number" : "bullet");
        else setBlockType("paragraph");
        const linkNode = $findMatchingParent(anchor, $isLinkNode);
        setFormats({
          bold: selection.hasFormat("bold"),
          italic: selection.hasFormat("italic"),
          strike: selection.hasFormat("strikethrough"),
          code: selection.hasFormat("code"),
          link: Boolean(linkNode),
        });
      });
      return false;
    }, COMMAND_PRIORITY_LOW),
  ), [editor]);

  function setBlock(next: BlockType) {
    if (next === "bullet") return editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    if (next === "number") return editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    if (blockType === "bullet" || blockType === "number") editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (next === "quote") $setBlocksType(selection, () => $createQuoteNode());
      else if (next === "h2" || next === "h3") $setBlocksType(selection, () => $createHeadingNode(next as HeadingTagType));
      else $setBlocksType(selection, () => $createParagraphNode());
    });
  }

  function toggleLink() {
    if (formats.link) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }
    const value = window.prompt("Paste a web address");
    if (!value) return;
    if (!validLink(value)) {
      window.alert("Use an http, https, mailto, telephone, page, or anchor link.");
      return;
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, value.trim());
  }

  return (
    <div aria-label="Content formatting" className="editor-toolbar" role="toolbar">
      <label className="sr-only" htmlFor="editor-block-style">Text style</label>
      <select className="editor-block-select" id="editor-block-style" onChange={(event) => setBlock(event.target.value as BlockType)} value={blockType}>
        <option value="paragraph">Paragraph</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="quote">Quote</option>
        <option value="bullet">Bullet list</option>
        <option value="number">Numbered list</option>
      </select>
      <span aria-hidden="true" className="editor-tool-divider" />
      <ToolbarButton active={formats.bold} label="Bold" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}><strong>B</strong></ToolbarButton>
      <ToolbarButton active={formats.italic} label="Italic" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}><em>I</em></ToolbarButton>
      <ToolbarButton active={formats.strike} label="Strikethrough" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}><span className="line-through">S</span></ToolbarButton>
      <ToolbarButton active={formats.code} label="Inline code" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}><span className="font-mono">&lt;/&gt;</span></ToolbarButton>
      <ToolbarButton active={formats.link} label={formats.link ? "Remove link" : "Add link"} onClick={toggleLink}>Link</ToolbarButton>
      <span aria-hidden="true" className="editor-tool-divider" />
      <ToolbarButton label="Insert media" onClick={onOpenMedia}>Media</ToolbarButton>
      <ToolbarButton label="Insert divider" onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}>Rule</ToolbarButton>
      <span className="editor-toolbar-spacer" />
      <ToolbarButton disabled={!canUndo} label="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>↶</ToolbarButton>
      <ToolbarButton disabled={!canRedo} label="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>↷</ToolbarButton>
    </div>
  );
}
