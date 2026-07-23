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
    });
    database = drizzle(sqlClient, { schema });
  }

  return database;
}
