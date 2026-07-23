import { TaxonomyArchive } from "@/components/taxonomy-archive";

export const dynamic = "force-dynamic";

export default async function CategoryArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TaxonomyArchive kind="category" slug={slug} />;
}
