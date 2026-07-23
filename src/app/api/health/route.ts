import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { getMediaStorageStats } from "@/lib/media/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "ok" | "error" = "ok";
  try {
    getDb().run(sql`SELECT 1`);
  } catch {
    database = "error";
  }
  const storage = await getMediaStorageStats();
  const status = database === "ok" ? "ok" : "degraded";
  return Response.json({ status, checks: { database, mediaStorage: storage.status } }, {
    status: status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
