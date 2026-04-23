import { Hono } from "hono";
import { getDb } from "@/db";
import { UserService } from "./users.service";
import { UserRepository } from "./users.repo";
import type { Bindings } from "@/types";

const userRoutes = new Hono<{ Bindings: Bindings }>();

userRoutes.get("/:id", async (c) => {
  try {
    const db = getDb(c.env);
    const service = new UserService(new UserRepository(db));
    const results = await service.getUserById(c.req.param("id"));
    return c.json(results);
  } catch (error) {
    console.error("USER ROUTES ERROR:", error);
    return c.json({ message: "Failed to get user by id" }, 500);
  }
});

userRoutes.post("/sync", async (c) => {
  try {
    const body = await c.req.json();
    const db = getDb(c.env);
    const service = new UserService(new UserRepository(db));
    const results = await service.syncUserData(body);
    return c.json(results);
  } catch (error) {
    console.error("USER ROUTES ERROR:", error);
    return c.json({ message: "Failed to sync user data" }, 500);
  }
});

export default userRoutes;
