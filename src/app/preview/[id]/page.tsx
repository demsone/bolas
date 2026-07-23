import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { getContentById, listTermsForContent } from "@/lib/content/repository";
import { getDb } from "@/lib/db/client";
import { getMediaById } from "@/lib/media/repository";
import { createThemeContent, getActiveTheme } from "@/lib/themes/runtime";

export const dynamic = "force-dynamic";

export default async function ContentPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, "manage_content")) notFound();
  const { id } = await params;
  const item = await getContentById(getDb(), id);
  if (!item) notFound();
  const featured = item.featuredMediaId ? await getMediaById(getDb(), item.featuredMediaId) : null;
  const terms = await listTermsForContent(getDb(), item.id);
  const content = createThemeContent(item, featured ? {
    id: featured.id,
    altText: featured.altText,
    caption: featured.caption,
    width: featured.width,
    height: featured.height,
  } : null, terms);
  const theme = getActiveTheme();
  const Template = item.kind === "post" ? theme.templates.Post : theme.templates.Page;
  return (
    <>
      <aside className="preview-ribbon"><span>{item.state} preview</span><Link href={`/admin/content/${item.id}`}>Return to editor</Link></aside>
      <Template content={content} manifest={theme.manifest} />
    </>
  );
}
