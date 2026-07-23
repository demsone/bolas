import Link from "next/link";
import { MediaUpload } from "@/components/media-upload";
import { getDb } from "@/lib/db/client";
import { listMedia } from "@/lib/media/repository";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const media = await listMedia(getDb(), q);

  return (
    <>
      <header className="border-b border-[var(--line)] pb-7">
        <p className="eyebrow">Library</p>
        <h1 className="admin-title">Media</h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">Upload reusable images, add accessible descriptions, and attach them to pages or posts.</p>
      </header>
      <section className="mt-8"><MediaUpload /></section>
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-lg font-semibold">Images</h2><p className="mt-1 text-sm text-[var(--muted)]">{media.length} {media.length === 1 ? "result" : "results"}</p></div>
          <form className="flex gap-2" method="get"><label className="sr-only" htmlFor="media-search">Search media</label><input className="hearth-input min-w-56" defaultValue={q} id="media-search" name="q" placeholder="Search images…" /><button className="hearth-button-secondary" type="submit">Search</button></form>
        </div>
        {media.length === 0 ? (
          <div className="admin-panel mt-5 grid place-items-center text-center"><div><p className="font-medium">{q ? "No matching images." : "Your media library is empty."}</p><p className="mt-2 text-sm text-[var(--muted)]">{q ? "Try another search." : "Upload the first image above."}</p></div></div>
        ) : (
          <div className="media-grid mt-5">
            {media.map((item) => (
              <Link className="media-card" href={`/admin/media/${item.id}`} key={item.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={item.altText || ""} loading="lazy" src={`/media/${item.id}`} />
                <div className="p-3"><p className="truncate text-sm font-semibold">{item.originalName}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.width} × {item.height} · {formatSize(item.size)}</p></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
