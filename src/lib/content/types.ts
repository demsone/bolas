export const contentKinds = ["page", "post"] as const;
export const contentStates = ["draft", "published", "archived"] as const;

export type ContentKind = (typeof contentKinds)[number];
export type ContentState = (typeof contentStates)[number];

export type ContentInput = {
  kind: ContentKind;
  state: ContentState;
  slug: string;
  title: string;
  excerpt: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  body: string;
  featuredMediaId: string | null;
  layout: "article" | "scrollytelling";
  heroMediaId: string | null;
  termIds: string[];
};

export const taxonomyKinds = ["category", "tag"] as const;
export type TaxonomyKind = (typeof taxonomyKinds)[number];

export type TaxonomyTerm = {
  id: string;
  kind: TaxonomyKind;
  name: string;
  slug: string;
};
