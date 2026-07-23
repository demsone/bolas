"use client";

import { useActionState } from "react";
import type { MediaActionState } from "@/app/actions/media";

type MediaAction = (state: MediaActionState, formData: FormData) => Promise<MediaActionState>;

export function MediaMetadataForm({ action, altText, caption }: { action: MediaAction; altText: string; caption: string | null }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5">
      <label className="content-label">Alternative text<textarea className="hearth-input min-h-24 resize-y" defaultValue={altText} name="altText" /><span className="font-normal text-[var(--muted)]">Describe the image for people using screen readers. Leave empty only when decorative.</span></label>
      <label className="content-label">Caption<textarea className="hearth-input min-h-24 resize-y" defaultValue={caption ?? ""} name="caption" /></label>
      {state.error && <p aria-live="polite" className="border-l-2 border-[var(--ember)] bg-[#f8e6df] px-3 py-2 text-sm">{state.error}</p>}
      <button className="hearth-button w-auto" disabled={pending} type="submit">{pending ? "Saving…" : "Save details"}</button>
    </form>
  );
}
