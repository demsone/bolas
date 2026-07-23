"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import { createSession, deleteSession } from "@/lib/auth/session";
import { createUser, hasAnyUser, hashPassword } from "@/lib/auth/users";

export type AuthActionState = { error?: string };

const credentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(12, "Use at least 12 characters for your password."),
});

const ownerDetails = credentials.extend({
  displayName: z.string().trim().min(2, "Enter your name.").max(80),
});

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

export async function logout() {
  await deleteSession();
  redirect("/login");
}
