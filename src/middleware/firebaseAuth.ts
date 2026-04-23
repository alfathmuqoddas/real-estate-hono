// middlewares/firebaseAuth.ts
import { MiddlewareHandler } from "hono";
import { jwtVerify } from "jose";
import { getDb } from "@/db";
import { usersTable } from "@/modules/users/users.model";
import { eq } from "drizzle-orm";

const GOOGLE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cachedKeys: Record<string, string> | null = null;
let lastFetch = 0;

async function getGoogleCerts() {
  const now = Date.now();
  if (!cachedKeys || now - lastFetch > 60 * 60 * 1000) {
    const res = await fetch(GOOGLE_CERTS_URL);
    cachedKeys = (await res.json()) as Record<string, string>;
    lastFetch = now;
  }
  return cachedKeys;
}

export const firebaseAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const keys = await getGoogleCerts();
    const kid = JSON.parse(atob(idToken.split(".")[0])).kid;
    const cert = keys[kid];
    if (!cert) throw new Error("Invalid key ID");

    const { payload } = await jwtVerify(
      idToken,
      await crypto.subtle.importKey(
        "spki",
        new TextEncoder().encode(cert),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"],
      ),
      {
        issuer: `https://securetoken.google.com/${c.env.FIREBASE_PROJECT_ID}`,
        audience: c.env.FIREBASE_PROJECT_ID,
      },
    );

    if (!payload.sub) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const db = getDb(c.env);

    const userRow = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.sub))
      .get();

    if (!userRow) return c.json({ error: "User not found" }, 404);

    c.set("user", {
      uid: payload.sub,
      email: payload.email,
      role: userRow.role,
    });
    await next();
  } catch (err) {
    console.error(err);
    return c.json({ error: "Invalid token" }, 401);
  }
};
