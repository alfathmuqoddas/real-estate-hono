import { Hono } from "hono";
import { getDb } from "@/db";
import { UserService } from "./users.service";
import { UserRepository } from "./users.repo";
import type { AppEnv } from "@/types";
import {
  firebaseAuthMiddleware,
  firebaseAuthOptionalMiddleware,
} from "@/middleware";

const userRoutes = new Hono<AppEnv>();

userRoutes.get("/sync", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new UserService(new UserRepository(db));
  const results = await service.syncUserData(user);
  return c.json(results);
});

userRoutes.get("/protected", firebaseAuthMiddleware, async (c) => {
  const user = c.get("userFirebase");
  return c.json({
    message: `Hello ${user.name}! Your id is ${user.uid}, and your role is ${user.role}`,
  });
});

userRoutes.get("/soft-protected", firebaseAuthOptionalMiddleware, async (c) => {
  const user = c.get("userFirebase");
  if (!user) {
    return c.json({
      message: "Hello anonymous user! You are not logged in",
    });
  }
  return c.json({
    message: `Hello ${user.name}! Your id is ${user.uid}`,
  });
});

userRoutes.get("/:id", async (c) => {
  const db = getDb(c.env);
  const service = new UserService(new UserRepository(db));
  const results = await service.getUserById(c.req.param("id"));
  return c.json(results);
});

export default userRoutes;
