import Link from "next/link";
import { notFound } from "next/navigation";
import { updateMedia } from "@/app/actions/media";
import { MediaMetadataForm } from "@/components/media-metadata-form";
import { getDb } from "@/lib/db/client";
import { getMediaById } from "@/lib/media/repository";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function MediaDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const media = await getMediaById(getDb(), id);
  if (!media) notFound();
  const action = updateMedia.bind(null, id);

  return (
    <>
      <header className="border-b border-[var(--line)] pb-7"><Link className="text-sm text-[var(--muted)] hover:text-[var(--ink)]" href="/admin/media">← Media</Link><h1 className="admin-title mt-4">Image details</h1></header>
      {query.saved && <p className="mt-6 border-l-2 border-[#397357] bg-[#e6f2eb] px-3 py-2 text-sm">Image details saved.</p>}
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-h-80 place-items-center border border-[var(--line)] bg-[#f0f1ec] p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={media.altText || ""} className="max-h-[38rem] max-w-full object-contain" src={`/media/${media.id}`} />
        </div>
        <aside className="space-y-7">
          <MediaMetadataForm action={action} altText={media.altText} caption={media.caption} />
          <dl className="space-y-3 border-t border-[var(--line)] pt-5 text-sm">
            <div><dt className="text-[var(--muted)]">Original filename</dt><dd className="mt-1 break-all font-medium">{media.originalName}</dd></div>
            <div><dt className="text-[var(--muted)]">Dimensions</dt><dd className="mt-1">{media.width} × {media.height}px</dd></div>
            <div><dt className="text-[var(--muted)]">Format</dt><dd className="mt-1">Optimised WebP</dd></div>
            <div><dt className="text-[var(--muted)]">Uploaded</dt><dd className="mt-1">{formatDate(media.createdAt)}</dd></div>
          </dl>
        </aside>
      </div>
    </>
  );
}
