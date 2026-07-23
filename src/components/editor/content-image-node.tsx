"use client";

import type { JSX } from "react";
import {
  $applyNodeReplacement,
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { EditorImage } from "./editor-image";

export type ContentImagePayload = {
  altText: string;
  caption: string | null;
  height: number;
  key?: NodeKey;
  src: string;
  width: number;
};

type SerializedContentImageNode = Spread<
  {
    altText: string;
    caption: string | null;
    height: number;
    src: string;
    width: number;
  },
  SerializedLexicalNode
>;

export class ContentImageNode extends DecoratorNode<JSX.Element> {
  __altText: string;
  __caption: string | null;
  __height: number;
  __src: string;
  __width: number;

  static getType() {
    return "hearth-content-image";
  }

  static clone(node: ContentImageNode) {
    return new ContentImageNode(
      {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        src: node.__src,
        width: node.__width,
      },
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedContentImageNode) {
    return $createContentImageNode(serializedNode);
  }

  constructor(payload: Omit<ContentImagePayload, "key">, key?: NodeKey) {
    super(key);
    this.__altText = payload.altText;
    this.__caption = payload.caption;
    this.__height = payload.height;
    this.__src = payload.src;
    this.__width = payload.width;
  }

  createDOM(config: EditorConfig) {
    const element = document.createElement("div");
    const className = config.theme.image;
    if (typeof className === "string") element.className = className;
    return element;
  }

  updateDOM() {
    return false;
  }

  exportJSON(): SerializedContentImageNode {
    return {
      ...super.exportJSON(),
      altText: this.__altText,
      caption: this.__caption,
      height: this.__height,
      src: this.__src,
      type: "hearth-content-image",
      version: 1,
      width: this.__width,
    };
  }

  isInline() {
    return false;
  }

  decorate() {
    return (
      <EditorImage
        altText={this.__altText}
        caption={this.__caption}
        height={this.__height}
        nodeKey={this.__key}
        src={this.__src}
        width={this.__width}
      />
    );
  }
}

export function $createContentImageNode(payload: ContentImagePayload) {
  return $applyNodeReplacement(new ContentImageNode(payload, payload.key));
}

export function $isContentImageNode(node: LexicalNode | null | undefined): node is ContentImageNode {
  return node instanceof ContentImageNode;
}
