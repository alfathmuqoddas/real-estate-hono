import { Hono } from "hono";
import { getDb } from "@/db";
import { UserService } from "./users.service";
import { UserRepository } from "./users.repo";
import type { Bindings, UserContext } from "@/types";
import { firebaseAuthMiddleware } from "@/middleware";

const userRoutes = new Hono<{
  Bindings: Bindings;
  Variables: UserContext;
}>();

userRoutes.get("/sync", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new UserService(new UserRepository(db));
  const results = await service.syncUserData(user);
  return c.json(results);
});

userRoutes.get("/:id", async (c) => {
  const db = getDb(c.env);
  const service = new UserService(new UserRepository(db));
  const results = await service.getUserById(c.req.param("id"));
  return c.json(results);
});

export default userRoutes;
