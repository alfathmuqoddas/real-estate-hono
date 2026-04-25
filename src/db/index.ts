// db/client.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import type { Bindings } from "@/types";
import * as schema from "@/db/schema";

export function getDb(env: Bindings) {
  const client = createClient({
    url: env.TURSO_CONNECTION_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}
