import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, desc, eq, gt, ne } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { getSecuritySettings } from "@/lib/settings/repository";
import { can, type Capability, type Role } from "./permissions";

const SESSION_COOKIE = "bolas_session";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type CurrentUser = {
  id: string;
  displayName: string;
  email: string;
  role: Role;
};

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const sessionMaxAge = (await getSecuritySettings(getDb())).sessionDays * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + sessionMaxAge * 1000);
  const now = new Date();
  const userAgent = (await headers()).get("user-agent")?.slice(0, 240) ?? null;

  await getDb().insert(sessions).values({
    id: randomUUID(),
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    createdAt: now,
    lastSeenAt: now,
    userAgent,
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await getDb().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<{ sessionId: string; user: CurrentUser } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [session] = await getDb()
    .select({
      sessionId: sessions.id,
      userId: users.id,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!session) return null;

  return {
    sessionId: session.sessionId,
    user: {
      id: session.userId,
      displayName: session.displayName,
      email: session.email,
      role: session.role as Role,
    },
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return (await getCurrentSession())?.user ?? null;
}

export async function listActiveSessions() {
  return getDb().select({
    id: sessions.id,
    userId: users.id,
    displayName: users.displayName,
    email: users.email,
    createdAt: sessions.createdAt,
    lastSeenAt: sessions.lastSeenAt,
    expiresAt: sessions.expiresAt,
    userAgent: sessions.userAgent,
  }).from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(gt(sessions.expiresAt, new Date()))
    .orderBy(desc(sessions.createdAt));
}

export async function revokeSession(sessionId: string) {
  await getDb().delete(sessions).where(eq(sessions.id, sessionId));
}

export async function revokeOtherSessions(currentSessionId: string) {
  return (await getDb().delete(sessions).where(ne(sessions.id, currentSessionId)).returning({ id: sessions.id })).length;
}

export async function requireCapability(capability: Capability) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, capability)) throw new Error("You do not have permission to do that.");
  return user;
}
