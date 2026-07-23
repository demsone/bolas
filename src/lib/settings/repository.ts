import { eq } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { securitySettings, siteSettings } from "@/lib/db/schema";

type Database = ReturnType<typeof getDb>;

export const DEFAULT_SITE_SETTINGS = {
  siteName: "Bolas!",
  siteDescription: "Magazine stories, essays, and continuing written pieces.",
  language: "en-AU",
  timezone: "Australia/Melbourne",
  homeHeroMediaId: null as string | null,
};

export const DEFAULT_SECURITY_SETTINGS = {
  maxLoginAttempts: 8,
  lockoutMinutes: 15,
  sessionDays: 14,
  trustProxyHeaders: false,
};

export type SiteSettings = typeof DEFAULT_SITE_SETTINGS;
export type SecuritySettings = typeof DEFAULT_SECURITY_SETTINGS;

export async function getSiteSettings(db: Database): Promise<SiteSettings> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, "site")).limit(1);
  return row ? {
    siteName: row.siteName,
    siteDescription: row.siteDescription,
    language: row.language,
    timezone: row.timezone,
    homeHeroMediaId: row.homeHeroMediaId,
  } : DEFAULT_SITE_SETTINGS;
}

export async function saveSiteSettings(db: Database, values: SiteSettings, userId: string) {
  const now = new Date();
  await db.insert(siteSettings).values({
    id: "site",
    ...values,
    updatedById: userId,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: siteSettings.id,
    set: { ...values, updatedById: userId, updatedAt: now },
  });
}

export async function getSecuritySettings(db: Database): Promise<SecuritySettings> {
  const [row] = await db.select().from(securitySettings).where(eq(securitySettings.id, "security")).limit(1);
  return row ? {
    maxLoginAttempts: row.maxLoginAttempts,
    lockoutMinutes: row.lockoutMinutes,
    sessionDays: row.sessionDays,
    trustProxyHeaders: row.trustProxyHeaders,
  } : DEFAULT_SECURITY_SETTINGS;
}

export async function saveSecuritySettings(db: Database, values: SecuritySettings, userId: string) {
  const now = new Date();
  await db.insert(securitySettings).values({
    id: "security",
    ...values,
    updatedById: userId,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: securitySettings.id,
    set: { ...values, updatedById: userId, updatedAt: now },
  });
}
