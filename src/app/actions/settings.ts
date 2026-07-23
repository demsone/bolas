"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAllLoginLimits } from "@/lib/auth/rate-limit";
import {
  deleteSession,
  getCurrentSession,
  requireCapability,
  revokeOtherSessions,
  revokeSession,
} from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import {
  saveSecuritySettings,
  saveSiteSettings,
} from "@/lib/settings/repository";

export type SettingsActionState = { error?: string; success?: string };

const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Enter a site name.").max(80),
  siteDescription: z.string().trim().max(300, "Keep the description under 300 characters."),
  language: z.enum(["en-AU", "en-GB", "en-US"]),
  timezone: z.enum(["Australia/Melbourne", "Australia/Sydney", "UTC"]),
});

const securitySettingsSchema = z.object({
  maxLoginAttempts: z.coerce.number().int().min(3).max(20),
  lockoutMinutes: z.coerce.number().int().min(5).max(1440),
  sessionDays: z.coerce.number().int().min(1).max(90),
  trustProxyHeaders: z.boolean(),
});

async function recordAudit(actorId: string, action: string, subjectId: string, detail?: Record<string, unknown>) {
  await getDb().insert(auditEvents).values({
    id: randomUUID(),
    actorId,
    action,
    subjectType: "settings",
    subjectId,
    detail,
    createdAt: new Date(),
  });
}

export async function updateSiteSettings(
  _: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireCapability("manage_site");
  const parsed = siteSettingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteDescription: formData.get("siteDescription"),
    language: formData.get("language"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the site settings." };

  await saveSiteSettings(getDb(), { ...parsed.data, homeHeroMediaId: (formData.get("homeHeroMediaId") as string) || null }, user.id);
  await recordAudit(user.id, "settings.site_updated", "site");
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: "Site settings saved." };
}

export async function updateSecuritySettings(
  _: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireCapability("manage_security");
  const parsed = securitySettingsSchema.safeParse({
    maxLoginAttempts: formData.get("maxLoginAttempts"),
    lockoutMinutes: formData.get("lockoutMinutes"),
    sessionDays: formData.get("sessionDays"),
    trustProxyHeaders: formData.get("trustProxyHeaders") === "on",
  });
  if (!parsed.success) return { error: "Check the protection limits and try again." };

  await saveSecuritySettings(getDb(), parsed.data, user.id);
  await recordAudit(user.id, "settings.security_updated", "security");
  revalidatePath("/admin/security");
  return { success: "Security settings saved. New sessions will use the updated lifetime." };
}

export async function revokeSessionAction(sessionId: string) {
  const user = await requireCapability("manage_security");
  const current = await getCurrentSession();
  if (!current) redirect("/login");

  await revokeSession(sessionId);
  await recordAudit(user.id, "session.revoked", sessionId);
  if (current.sessionId === sessionId) {
    await deleteSession();
    redirect("/login");
  }
  revalidatePath("/admin/security");
}

export async function revokeOtherSessionsAction() {
  const user = await requireCapability("manage_security");
  const current = await getCurrentSession();
  if (!current) redirect("/login");
  const count = await revokeOtherSessions(current.sessionId);
  await recordAudit(user.id, "session.others_revoked", current.sessionId, { count });
  revalidatePath("/admin/security");
}

export async function clearLoginLimitsAction() {
  const user = await requireCapability("manage_security");
  await clearAllLoginLimits();
  await recordAudit(user.id, "security.lockouts_cleared", "login");
  revalidatePath("/admin/security");
}
