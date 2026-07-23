import "server-only";

import argon2 from "argon2";
import { count, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { Role } from "./permissions";

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export async function hasAnyUser() {
  const [result] = await getDb().select({ total: count() }).from(users).limit(1);
  return (result?.total ?? 0) > 0;
}

export async function getUserByEmail(email: string) {
  const [user] = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export type NewUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: Role;
};

export async function createUser(user: NewUser) {
  const now = new Date();
  await getDb().insert(users).values({ ...user, createdAt: now, updatedAt: now });
}
