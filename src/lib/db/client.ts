import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqlClient: postgres.Sql | null = null;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. Use the Supabase pooled Postgres connection string.");
  }
  return databaseUrl;
}

export function getDb() {
  if (!database) {
    sqlClient = postgres(getDatabaseUrl(), {
      max: 1,
      prepare: false,
      ssl: process.env.DATABASE_SSL === "false" ? false : "require",
      connect_timeout: Number(process.env.DATABASE_CONNECT_TIMEOUT ?? 10),
      idle_timeout: 20,
      connection: {
        application_name: "bolas",
        statement_timeout: Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS ?? 10_000),
      },
    });
    database = drizzle(sqlClient, { schema });
  }

  return database;
}
