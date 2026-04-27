import { MiddlewareHandler } from "hono";
import { getDb } from "@/db";
import { usersTable } from "@/modules/users/users.model";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "@/errors/http-errors";
import { verifyToken, JWKS } from "./helper";

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
  const payload = await verifyToken(
    c.req.header("Authorization"),
    c.env.FIREBASE_PROJECT_ID,
    JWKS,
  );

  if (!payload || !payload.sub) {
    throw new UnauthorizedError("Invalid or missing token");
  }

  c.set("userFirebase", {
    uid: payload.sub,
    email: payload.email,
    name: payload.name,
    photoUrl: payload.picture,
  });

  await next();
};

export const firebaseAuthOptionalMiddleware: MiddlewareHandler = async (
  c,
  next,
) => {
  const payload = await verifyToken(
    c.req.header("Authorization"),
    c.env.FIREBASE_PROJECT_ID,
    JWKS,
  );

  if (payload?.sub) {
    c.set("userFirebase", {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      photoUrl: payload.picture,
    });
  }

  await next();
};
