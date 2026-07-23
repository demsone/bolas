import Link from "next/link";
import { createContent } from "@/app/actions/content";
import { ContentForm } from "@/components/content-form";
import { getDb } from "@/lib/db/client";
import { listTaxonomyTerms } from "@/lib/content/repository";
import { listMedia } from "@/lib/media/repository";

export default async function NewContentPage() {
  const media = await listMedia(getDb());
  const terms = await listTaxonomyTerms(getDb());
  return <><header className="border-b border-[var(--line)] pb-7"><Link className="text-sm text-[var(--muted)] hover:text-[var(--ink)]" href="/admin/content">← Content</Link><h1 className="admin-title mt-4">Create content</h1></header><ContentForm action={createContent} media={media} terms={terms} /></>;
}
