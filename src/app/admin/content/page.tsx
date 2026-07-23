import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listContent } from "@/lib/content/repository";
import { publicContentUrl } from "@/lib/content/url";

function formatDate(date: Date) { return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(date); }

export default async function ContentPage() {
  const items = await listContent(getDb());
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-7"><div><p className="eyebrow">Stories and pages</p><h1 className="admin-title">Content</h1></div><div className="flex flex-wrap gap-3"><Link className="hearth-button-link" href="/admin/content/new">Create content</Link></div></header>
      {items.length === 0 ? (
        <section className="mt-8 border border-dashed border-[var(--line)] p-10 text-center"><h2 className="text-xl font-semibold">Nothing here yet</h2><p className="mt-2 text-[var(--muted)]">Create your first page or post.</p></section>
      ) : (
        <div className="mt-8 overflow-x-auto border border-[var(--line)] bg-white">
          <table className="content-table"><thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{items.map((item) => {
            const live = item.state === "published";
            const viewUrl = live ? publicContentUrl(item.kind, item.slug) : `/preview/${item.id}`;
            return <tr key={item.id}><td><Link className="font-semibold hover:text-[var(--ember)]" href={`/admin/content/${item.id}`}>{item.title}</Link><p className="mt-1 font-mono text-xs text-[var(--muted)]">{publicContentUrl(item.kind, item.slug)}</p></td><td className="capitalize">{item.kind}</td><td><span className={`status-badge status-${item.state}`}>{item.state}</span></td><td>{formatDate(item.updatedAt)}</td><td><Link aria-label={`${live ? "View live" : "Preview"} ${item.title}`} className="content-view-link" href={viewUrl} rel="noreferrer" target="_blank"><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M2.75 12s3.25-6 9.25-6 9.25 6 9.25 6-3.25 6-9.25 6-9.25-6-9.25-6Z" /><circle cx="12" cy="12" r="2.75" /></svg><span>{live ? "View" : "Preview"}</span></Link></td></tr>;
          })}</tbody></table>
        </div>
      )}
    </>
  );
}
