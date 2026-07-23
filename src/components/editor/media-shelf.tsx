"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { EditorMedia } from "@/lib/media/types";

type MediaShelfProps = {
  media: EditorMedia[];
  onClose: () => void;
  onInsert: (media: EditorMedia) => void;
  onUploaded: (media: EditorMedia) => void;
  open: boolean;
};

export function MediaShelf({ media, onClose, onInsert, onUploaded, open }: MediaShelfProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  const normalisedQuery = query.trim().toLowerCase();
  const filteredMedia = normalisedQuery
    ? media.filter((item) => [item.originalName, item.altText, item.caption ?? ""].some((value) => value.toLowerCase().includes(normalisedQuery)))
    : media;

  async function uploadAndInsert() {
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setMessage("Choose an image first.");
      return;
    }
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("altText", altText);
    formData.set("caption", caption);
    try {
      const response = await fetch("/api/media", { method: "POST", body: formData });
      const result = await response.json() as { error?: string; media?: EditorMedia };
      if (!response.ok || !result.media) {
        setMessage(result.error ?? "The upload could not be saved.");
        return;
      }
      onUploaded(result.media);
      setAltText("");
      setCaption("");
      if (fileInput.current) fileInput.current.value = "";
    } catch {
      setMessage("Bolas could not reach the upload service.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="media-shelf-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section aria-labelledby="media-shelf-title" aria-modal="true" className="media-shelf" role="dialog">
        <header className="media-shelf-header">
          <div>
            <p className="eyebrow">Inline media</p>
            <h2 id="media-shelf-title">Media shelf</h2>
            <p>Insert an existing image or upload one without leaving your draft.</p>
          </div>
          <button aria-label="Close media shelf" className="media-shelf-close" onClick={onClose} type="button">×</button>
        </header>

        <div className="media-shelf-body">
          <aside className="media-shelf-upload">
            <div><h3>Upload and insert</h3><p>Bolas optimises the original to WebP and keeps it in the library.</p></div>
            <label className="content-label">Image<input accept="image/jpeg,image/png,image/webp" className="hearth-input" ref={fileInput} type="file" /></label>
            <label className="content-label">Alternative text<input className="hearth-input" maxLength={300} onChange={(event) => setAltText(event.target.value)} placeholder="Describe what matters in the image" value={altText} /></label>
            <label className="content-label">Caption <span className="font-normal text-[var(--muted)]">Optional</span><textarea className="hearth-input min-h-24 resize-y" maxLength={1000} onChange={(event) => setCaption(event.target.value)} value={caption} /></label>
            {message && <p aria-live="polite" className="media-shelf-message">{message}</p>}
            <button className="hearth-button" disabled={uploading} onClick={() => void uploadAndInsert()} type="button">{uploading ? "Processing…" : "Upload and insert"}</button>
          </aside>

          <div className="media-shelf-library">
            <label className="content-label">Search library<input autoFocus className="hearth-input" onChange={(event) => setQuery(event.target.value)} placeholder="Filename, alt text, or caption…" value={query} /></label>
            <p className="media-shelf-count">{filteredMedia.length} {filteredMedia.length === 1 ? "image" : "images"}</p>
            {filteredMedia.length === 0 ? (
              <div className="media-shelf-empty"><p>{media.length ? "No images match that search." : "Your media shelf is empty."}</p><span>{media.length ? "Try another phrase." : "Upload the first image from this panel."}</span></div>
            ) : (
              <div className="media-shelf-grid">
                {filteredMedia.map((item) => (
                  <button className="media-shelf-card" key={item.id} onClick={() => onInsert(item)} type="button">
                    <Image alt={item.altText} height={item.height} sizes="(max-width: 760px) 50vw, 220px" src={`/media/${item.id}`} unoptimized width={item.width} />
                    <span><strong>{item.altText || item.originalName}</strong><small>{item.caption || (item.altText ? item.originalName : "Alternative text missing")}</small></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
