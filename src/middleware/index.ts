import { MiddlewareHandler } from "hono";
import { UnauthorizedError } from "@/errors/http-errors";
import { verifyToken, JWKS } from "./helper";

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
    role: payload.role,
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
