import { getDb } from "@/lib/db/client";
import { listPublishedPosts } from "@/lib/content/repository";
import { getActiveTheme } from "@/lib/themes/runtime";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const posts = (await listPublishedPosts(getDb())).map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
  }));
  const theme = getActiveTheme();
  const JournalTemplate = theme.templates.Journal;
  return <JournalTemplate manifest={theme.manifest} posts={posts} />;
}
