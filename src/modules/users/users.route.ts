import { Hono } from "hono";
import { getDb } from "@/db";
import { UserService } from "./users.service";
import { UserRepository } from "./users.repo";
import type { Bindings } from "@/types";

const userRoutes = new Hono<{ Bindings: Bindings }>();

userRoutes.get("/:id", async (c) => {
  const db = getDb(c.env);
  const service = new UserService(new UserRepository(db));
  const results = await service.getUserById(c.req.param("id"));
  return c.json(results);
});

userRoutes.post("/sync", async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const service = new UserService(new UserRepository(db));
  const results = await service.syncUserData(body);
  return c.json(results);
});

export default userRoutes;
