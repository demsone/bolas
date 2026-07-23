"use client";

import Image from "next/image";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";

type EditorImageProps = {
  altText: string;
  caption: string | null;
  height: number;
  nodeKey: NodeKey;
  src: string;
  width: number;
};

export function EditorImage({ altText, caption, height, nodeKey, src, width }: EditorImageProps) {
  const [editor] = useLexicalComposerContext();

  function removeImage() {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
  }

  return (
    <figure className="content-editor-image">
      <div className="content-editor-image-frame">
        <Image alt={altText} height={height} sizes="(max-width: 900px) 100vw, 760px" src={src} unoptimized width={width} />
        <button aria-label="Remove image from content" className="content-editor-image-remove" onClick={removeImage} type="button">
          Remove
        </button>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {!altText && <p className="content-editor-image-warning">Alternative text is empty. Update it in Media before publishing.</p>}
    </figure>
  );
}
