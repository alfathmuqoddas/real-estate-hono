import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import type { Context } from "hono";

export const createDb = (c: Context) => {
  return drizzle(
    createClient({
      url: c.env.TURSO_DATABASE_URL,
      authToken: c.env.TURSO_AUTH_TOKEN,
    }),
  );
};
