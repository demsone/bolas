"use client";

import { useActionState } from "react";
import { updateSiteSettings } from "@/app/actions/settings";
import type { EditorMedia } from "@/lib/media/types";
import type { SiteSettings } from "@/lib/settings/repository";

export function SiteSettingsForm({ settings, media }: { settings: SiteSettings; media: EditorMedia[] }) {
  const [state, action, pending] = useActionState(updateSiteSettings, {});

  return (
    <form action={action} className="space-y-5">
      <label className="content-label">
        Site name
        <input className="hearth-input" defaultValue={settings.siteName} maxLength={80} name="siteName" />
        <span className="font-normal text-[var(--muted)]">Used in the public masthead, page titles, and browser metadata.</span>
      </label>
      <label className="content-label">
        Site description
        <textarea className="hearth-input min-h-28 resize-y" defaultValue={settings.siteDescription} maxLength={300} name="siteDescription" />
      </label>
      <label className="content-label">
        Landing background image
        <select className="hearth-input" defaultValue={settings.homeHeroMediaId ?? ""} name="homeHeroMediaId">
          <option value="">No background image</option>
          {media.map((item) => <option key={item.id} value={item.id}>{item.altText || item.originalName}</option>)}
        </select>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="content-label">
          Language
          <select className="hearth-input" defaultValue={settings.language} name="language">
            <option value="en-AU">English (Australia)</option>
            <option value="en-GB">English (United Kingdom)</option>
            <option value="en-US">English (United States)</option>
          </select>
        </label>
        <label className="content-label">
          Timezone
          <select className="hearth-input" defaultValue={settings.timezone} name="timezone">
            <option value="Australia/Melbourne">Melbourne</option>
            <option value="Australia/Sydney">Sydney</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
      </div>
      {state.error && <p aria-live="polite" className="form-error">{state.error}</p>}
      {state.success && <p aria-live="polite" className="form-success">{state.success}</p>}
      <button className="hearth-button w-auto" disabled={pending} type="submit">{pending ? "Saving…" : "Save site settings"}</button>
    </form>
  );
}
