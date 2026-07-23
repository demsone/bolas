import { SiteSettingsForm } from "@/components/site-settings-form";
import { requireCapability } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listMedia } from "@/lib/media/repository";
import { getSiteSettings } from "@/lib/settings/repository";

export default async function SiteSettingsPage() {
  await requireCapability("manage_site");
  const settings = await getSiteSettings(getDb());
  const media = await listMedia(getDb());

  return (
    <>
      <header className="border-b border-[var(--line)] pb-7">
        <p className="eyebrow">Public identity</p>
        <h1 className="admin-title">Site settings</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Set the identity Bolas publishes. Theme styling stays in code and remains separate from these controls.</p>
      </header>
      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="admin-panel">
          <h2 className="text-lg font-semibold">Identity and locale</h2>
          <p className="mt-2 mb-6 text-sm leading-6 text-[var(--muted)]">Changes apply across browser metadata and the bundled public theme.</p>
          <SiteSettingsForm media={media} settings={settings} />
        </section>
        <aside className="border border-[var(--line)] bg-[#f7f8f3] p-6">
          <p className="eyebrow">Masthead proof</p>
          <div className="mt-6 border-y border-[var(--line)] py-5">
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-[var(--ember)] font-mono text-xs font-bold text-white">H</span>
              <strong>{settings.siteName}</strong>
            </div>
            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">{settings.siteDescription || "No site description set."}</p>
          </div>
          <dl className="mt-5 space-y-3 text-xs">
            <div><dt className="text-[var(--muted)]">Language</dt><dd className="mt-1 font-mono">{settings.language}</dd></div>
            <div><dt className="text-[var(--muted)]">Timezone</dt><dd className="mt-1 font-mono">{settings.timezone}</dd></div>
          </dl>
        </aside>
      </div>
    </>
  );
}
