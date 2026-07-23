import "server-only";

import { createHash } from "node:crypto";
import { eq, gt, inArray, lte } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { loginAttempts } from "@/lib/db/schema";
import { getSecuritySettings, type SecuritySettings } from "@/lib/settings/repository";

type Database = ReturnType<typeof getDb>;
export type LoginAttemptKey = { keyHash: string; scope: "address" | "identity" };

function hashKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createLoginAttemptKeys(address: string, email: string): LoginAttemptKey[] {
  return [
    { scope: "address", keyHash: hashKey(`address:${address}`) },
    { scope: "identity", keyHash: hashKey(`identity:${email.trim().toLowerCase()}`) },
  ];
}

async function context(db?: Database, settings?: SecuritySettings) {
  const database = db ?? getDb();
  return { db: database, settings: settings ?? await getSecuritySettings(database) };
}

export async function loginAllowed(keys: LoginAttemptKey[], db?: Database, settings?: SecuritySettings) {
  const current = await context(db, settings);
  const now = new Date();
  await current.db.delete(loginAttempts).where(lte(loginAttempts.resetAt, now));
  const attempts = await Promise.all(keys.map((key) => current.db.select().from(loginAttempts)
    .where(eq(loginAttempts.keyHash, key.keyHash)).limit(1)));
  return attempts.every(([attempt]) => {
    return !attempt || attempt.count < current.settings.maxLoginAttempts;
  });
}

export async function recordFailedLogin(keys: LoginAttemptKey[], db?: Database, settings?: SecuritySettings) {
  const current = await context(db, settings);
  const now = new Date();
  const resetAt = new Date(now.getTime() + current.settings.lockoutMinutes * 60_000);

  for (const key of keys) {
    const [attempt] = await current.db.select().from(loginAttempts)
      .where(eq(loginAttempts.keyHash, key.keyHash)).limit(1);
    if (!attempt || attempt.resetAt <= now) {
      await current.db.insert(loginAttempts).values({
        ...key,
        count: 1,
        resetAt,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: loginAttempts.keyHash,
        set: { scope: key.scope, count: 1, resetAt, updatedAt: now },
      });
    } else {
      await current.db.update(loginAttempts).set({
        count: attempt.count + 1,
        updatedAt: now,
      }).where(eq(loginAttempts.keyHash, key.keyHash));
    }
  }
}

export async function clearLoginAttempts(keys: LoginAttemptKey[], db: Database = getDb()) {
  await db.delete(loginAttempts).where(inArray(loginAttempts.keyHash, keys.map((key) => key.keyHash)));
}

export async function listActiveLoginLimits(db: Database = getDb()) {
  return db.select().from(loginAttempts).where(gt(loginAttempts.resetAt, new Date()));
}

export async function clearAllLoginLimits(db: Database = getDb()) {
  await db.delete(loginAttempts);
}
