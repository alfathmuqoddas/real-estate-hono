// middlewares/firebaseAuth.ts
import { MiddlewareHandler } from "hono";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { getDb } from "@/db";
import { usersTable } from "@/modules/users/users.model";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "@/errors/http-errors";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export const firebaseAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing Authorization header");
  }
  const idToken = authHeader.split(" ")[1];

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${c.env.FIREBASE_PROJECT_ID}`,
    audience: c.env.FIREBASE_PROJECT_ID,
  });

  if (!payload.sub) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const db = getDb(c.env);

  const userRow = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.sub))
    .get();

  if (!userRow) throw new UnauthorizedError("User not registered");

  c.set("user", {
    uid: payload.sub,
    email: payload.email,
    role: userRow.role,
  });
  await next();
};
