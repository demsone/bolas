"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import { clearLoginAttempts, createLoginAttemptKeys, loginAllowed, recordFailedLogin } from "@/lib/auth/rate-limit";
import { createSession, deleteSession } from "@/lib/auth/session";
import { createUser, getUserByEmail, hasAnyUser, hashPassword, verifyPassword } from "@/lib/auth/users";
import { getSecuritySettings } from "@/lib/settings/repository";

export type AuthActionState = { error?: string };

const credentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(12, "Use at least 12 characters for your password."),
});

const ownerDetails = credentials.extend({
  displayName: z.string().trim().min(2, "Enter your name.").max(80),
});

async function clientAddress() {
  if (!(await getSecuritySettings(getDb())).trustProxyHeaders) return "local";
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

async function recordAudit(actorId: string | null, action: string, subjectId: string | null, detail?: Record<string, string>) {
  await getDb().insert(auditEvents).values({
    id: randomUUID(),
    actorId,
    action,
    subjectType: action.startsWith("session.") ? "security" : "user",
    subjectId,
    detail,
    createdAt: new Date(),
  });
}

export async function setupOwner(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (await hasAnyUser()) redirect("/login");

  const parsed = ownerDetails.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };

  const userId = randomUUID();
  await createUser({
    id: userId,
    displayName: parsed.data.displayName,
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
    role: "owner",
  });
  await recordAudit(userId, "owner.created", userId);
  await createSession(userId);
  redirect("/admin");
}

export async function login(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter your email and password." };

  const address = await clientAddress();
  const attemptKeys = createLoginAttemptKeys(address, parsed.data.email);
  const security = await getSecuritySettings(getDb());
  if (!(await loginAllowed(attemptKeys, getDb(), security))) {
    return { error: `Too many attempts. Try again in ${security.lockoutMinutes} minutes.` };
  }

  const user = await getUserByEmail(parsed.data.email);
  if (!user || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
    await recordFailedLogin(attemptKeys, getDb(), security);
    await recordAudit(null, "session.failed", null, { reason: "invalid_credentials" });
    return { error: "Email or password is not recognised." };
  }

  await clearLoginAttempts(attemptKeys);
  await recordAudit(user.id, "session.created", user.id);
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
