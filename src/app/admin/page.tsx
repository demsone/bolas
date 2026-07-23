import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listContent } from "@/lib/content/repository";
import { listMedia } from "@/lib/media/repository";

export default async function AdminPage() {
  const items = await listContent(getDb());
  const published = items.filter((item) => item.state === "published").length;
  const drafts = items.filter((item) => item.state === "draft").length;
  const media = await listMedia(getDb());

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-7">
        <div><p className="eyebrow">Publishing desk</p><h1 className="admin-title">Bolas!</h1></div>
        <Link className="hearth-button-link" href="/admin/content/new">Create content</Link>
      </header>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["All content", items.length], ["Published", published], ["Drafts", drafts], ["Media", media.length]].map(([label, value]) => <section className="admin-panel" key={label}><p className="eyebrow">{label}</p><p className="mt-5 font-serif text-5xl">{value}</p></section>)}
      </div>
      <section className="mt-4 admin-panel">
        <h2 className="text-lg font-semibold">Next at the workbench</h2>
        <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">Create a story, add media, then publish when it is ready. Every save keeps the previous version.</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link className="hearth-button-secondary no-underline" href="/admin/content">Manage content</Link><Link className="hearth-button-secondary no-underline" href="/admin/media">Open media</Link></div>
      </section>
    </>
  );
}
