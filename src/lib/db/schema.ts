import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });
const boolean = (name: string) => integer(name, { mode: "boolean" });

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["owner", "admin", "editor"] }).notNull().default("editor"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    lastSeenAt: timestamp("last_seen_at"),
    userAgent: text("user_agent"),
  },
  (table) => [uniqueIndex("sessions_token_hash_unique").on(table.tokenHash)],
);

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    storageKey: text("storage_key").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    altText: text("alt_text").notNull().default(""),
    caption: text("caption"),
    sha256: text("sha256").notNull(),
    uploadedById: text("uploaded_by_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [uniqueIndex("media_assets_storage_key_unique").on(table.storageKey)],
);

export const contentItems = sqliteTable(
  "content_items",
  {
    id: text("id").primaryKey(),
    kind: text("kind", { enum: ["page", "post"] }).notNull(),
    state: text("state", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    noIndex: boolean("no_index").notNull().default(false),
    body: text("body").notNull().default(""),
    featuredMediaId: text("featured_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    authorId: text("author_id").notNull().references(() => users.id),
    layout: text("layout", { enum: ["article", "scrollytelling"] }).notNull().default("article"),
    heroMediaId: text("hero_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [uniqueIndex("content_items_slug_unique").on(table.slug)],
);

export const contentRevisions = sqliteTable("content_revisions", {
  id: text("id").primaryKey(),
  contentItemId: text("content_item_id").notNull().references(() => contentItems.id),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  canonicalUrl: text("canonical_url"),
  noIndex: boolean("no_index").notNull().default(false),
  body: text("body").notNull(),
  featuredMediaId: text("featured_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  layout: text("layout", { enum: ["article", "scrollytelling"] }).notNull().default("article"),
  heroMediaId: text("hero_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  savedById: text("saved_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull(),
});

export const taxonomyTerms = sqliteTable(
  "taxonomy_terms",
  {
    id: text("id").primaryKey(),
    kind: text("kind", { enum: ["category", "tag"] }).notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("taxonomy_terms_kind_slug_unique").on(table.kind, table.slug),
  ],
);

export const contentTaxonomyTerms = sqliteTable(
  "content_taxonomy_terms",
  {
    contentItemId: text("content_item_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
    termId: text("term_id").notNull().references(() => taxonomyTerms.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.contentItemId, table.termId] })],
);

export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey(),
  siteName: text("site_name").notNull(),
  siteDescription: text("site_description").notNull(),
  language: text("language").notNull(),
  timezone: text("timezone").notNull(),
  homeHeroMediaId: text("home_hero_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  updatedById: text("updated_by_id").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").notNull(),
});

export const securitySettings = sqliteTable("security_settings", {
  id: text("id").primaryKey(),
  maxLoginAttempts: integer("max_login_attempts").notNull(),
  lockoutMinutes: integer("lockout_minutes").notNull(),
  sessionDays: integer("session_days").notNull(),
  trustProxyHeaders: boolean("trust_proxy_headers").notNull().default(false),
  updatedById: text("updated_by_id").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").notNull(),
});

export const loginAttempts = sqliteTable("login_attempts", {
  keyHash: text("key_hash").primaryKey(),
  scope: text("scope", { enum: ["address", "identity"] }).notNull(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => users.id),
  action: text("action").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id"),
  detail: text("detail", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull(),
});
