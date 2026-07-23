import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqliteClient: Database.Database | null = null;

function getDatabasePath() {
  const configuredPath = process.env.SQLITE_PATH;
  return configuredPath
    ? path.resolve(/* turbopackIgnore: true */ process.cwd(), configuredPath)
    : path.join(process.cwd(), "data", "bolas.sqlite");
}

function initializeDatabase(client: Database.Database) {
  client.pragma("foreign_keys = ON");
  client.pragma("journal_mode = WAL");
  client.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      last_seen_at INTEGER,
      user_agent TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_hash_unique ON sessions (token_hash);

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY NOT NULL,
      storage_key TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      alt_text TEXT NOT NULL DEFAULT '',
      caption TEXT,
      sha256 TEXT NOT NULL,
      uploaded_by_id TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS media_assets_storage_key_unique ON media_assets (storage_key);

    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'draft',
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      seo_title TEXT,
      seo_description TEXT,
      canonical_url TEXT,
      no_index INTEGER NOT NULL DEFAULT 0,
      body TEXT NOT NULL DEFAULT '',
      featured_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      author_id TEXT NOT NULL REFERENCES users(id),
      layout TEXT NOT NULL DEFAULT 'article',
      hero_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      published_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS content_items_slug_unique ON content_items (slug);

    CREATE TABLE IF NOT EXISTS content_revisions (
      id TEXT PRIMARY KEY NOT NULL,
      content_item_id TEXT NOT NULL REFERENCES content_items(id),
      title TEXT NOT NULL,
      excerpt TEXT,
      seo_title TEXT,
      seo_description TEXT,
      canonical_url TEXT,
      no_index INTEGER NOT NULL DEFAULT 0,
      body TEXT NOT NULL,
      featured_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      layout TEXT NOT NULL DEFAULT 'article',
      hero_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      saved_by_id TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS taxonomy_terms (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS taxonomy_terms_kind_slug_unique ON taxonomy_terms (kind, slug);

    CREATE TABLE IF NOT EXISTS content_taxonomy_terms (
      content_item_id TEXT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
      term_id TEXT NOT NULL REFERENCES taxonomy_terms(id) ON DELETE CASCADE,
      PRIMARY KEY (content_item_id, term_id)
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY NOT NULL,
      site_name TEXT NOT NULL,
      site_description TEXT NOT NULL,
      language TEXT NOT NULL,
      timezone TEXT NOT NULL,
      home_hero_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
      updated_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS security_settings (
      id TEXT PRIMARY KEY NOT NULL,
      max_login_attempts INTEGER NOT NULL,
      lockout_minutes INTEGER NOT NULL,
      session_days INTEGER NOT NULL,
      trust_proxy_headers INTEGER NOT NULL DEFAULT 0,
      updated_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      key_hash TEXT PRIMARY KEY NOT NULL,
      scope TEXT NOT NULL,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY NOT NULL,
      actor_id TEXT REFERENCES users(id),
      action TEXT NOT NULL,
      subject_type TEXT NOT NULL,
      subject_id TEXT,
      detail TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}

export function getDb() {
  if (!database) {
    const dbPath = getDatabasePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    sqliteClient = new Database(dbPath);
    initializeDatabase(sqliteClient);
    database = drizzle(sqliteClient, { schema });
  }

  return database;
}
