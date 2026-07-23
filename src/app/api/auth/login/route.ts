import { randomUUID } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { clearLoginAttempts, createLoginAttemptKeys, loginAllowed, recordFailedLogin } from "@/lib/auth/rate-limit";
import { createSession } from "@/lib/auth/session";
import { getUserByEmail, verifyPassword } from "@/lib/auth/users";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import { getSecuritySettings } from "@/lib/settings/repository";

export const maxDuration = 30;

const credentials = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

function backToLogin(request: NextRequest, error: "credentials" | "locked" | "unavailable") {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

async function recordAudit(actorId: string | null, action: string, subjectId: string | null, detail?: Record<string, string>) {
  await getDb().insert(auditEvents).values({
    id: randomUUID(),
    actorId,
    action,
    subjectType: "security",
    subjectId,
    detail,
    createdAt: new Date(),
  });
}

export async function POST(request: NextRequest) {
  console.info("[auth/login] request started");
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return new Response("Invalid request origin.", { status: 403 });
  }

  try {
    const formData = await request.formData();
    const parsed = credentials.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) return backToLogin(request, "credentials");

    const security = await getSecuritySettings(getDb());
    const address = security.trustProxyHeaders
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
      : "local";
    const attemptKeys = createLoginAttemptKeys(address, parsed.data.email);

    if (!(await loginAllowed(attemptKeys, getDb(), security))) {
      console.warn("[auth/login] request rate-limited");
      return backToLogin(request, "locked");
    }

    const user = await getUserByEmail(parsed.data.email);
    if (!user || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
      await recordFailedLogin(attemptKeys, getDb(), security);
      await recordAudit(null, "session.failed", null, { reason: "invalid_credentials" });
      console.warn("[auth/login] credentials rejected");
      return backToLogin(request, "credentials");
    }

    await createSession(user.id, security.sessionDays);
    console.info("[auth/login] session created");
    after(async () => {
      try {
        await clearLoginAttempts(attemptKeys);
        await recordAudit(user.id, "session.created", user.id);
      } catch (error) {
        console.error("[auth/login] post-response audit failed", {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });
  } catch (error) {
    console.error("[auth/login] failed", {
      message: error instanceof Error ? error.message : String(error),
      code: typeof error === "object" && error && "code" in error ? String(error.code) : undefined,
    });
    return backToLogin(request, "unavailable");
  }

  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
