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

export const roleMiddleware: MiddlewareHandler = async (c, next) => {
  const userFirebase = c.get("userFirebase");

  if (!userFirebase) {
    throw new UnauthorizedError("Missing userFirebase");
  }

  const db = getDb(c.env);

  const userRow = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userFirebase.uid))
    .get();

  if (!userRow) throw new UnauthorizedError("User not registered");

  c.set("userRole", {
    role: userRow.role,
  });

  await next();
};

export const firebaseAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing Authorization header");
  }
  const idToken = authHeader.split(" ")[1];

  const result = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${c.env.FIREBASE_PROJECT_ID}`,
    audience: c.env.FIREBASE_PROJECT_ID,
  });

  if (!result.payload.sub) {
    throw new UnauthorizedError("Invalid token");
  }

  c.set("userFirebase", {
    uid: result.payload.sub,
    email: result.payload.email,
    name: result.payload.name,
    photoUrl: result.payload.picture,
  });

  await next();
};
