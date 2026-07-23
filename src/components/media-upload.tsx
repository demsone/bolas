"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function MediaUpload() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function upload(formData: FormData) {
    setUploading(true);
    setMessage("");
    try {
      const response = await fetch("/api/media", { method: "POST", body: formData });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok || !result.id) {
        setMessage(result.error ?? "The upload failed.");
        return;
      }
      router.push(`/admin/media/${result.id}`);
      router.refresh();
    } catch {
      setMessage("Bolas could not reach the upload service.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="media-upload"
      onSubmit={(event) => {
        event.preventDefault();
        const file = input.current?.files?.[0];
        if (!file) return setMessage("Choose an image first.");
        const formData = new FormData();
        formData.set("file", file);
        void upload(formData);
      }}
    >
      <div>
        <p className="font-semibold">Upload an image</p>
        <p className="mt-1 text-sm text-[var(--muted)]">JPEG, PNG, or WebP · maximum 10 MB</p>
      </div>
      <input accept="image/jpeg,image/png,image/webp" className="hearth-input" name="file" ref={input} type="file" />
      {message && <p aria-live="polite" className="text-sm text-[var(--ember)]">{message}</p>}
      <button className="hearth-button w-auto" disabled={uploading} type="submit">{uploading ? "Processing…" : "Upload image"}</button>
    </form>
  );
}
