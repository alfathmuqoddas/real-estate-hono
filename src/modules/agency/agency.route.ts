import { Hono } from "hono";
import { getDb } from "@/db";
import { AgencyService } from "./agency.service";
import { AgencyRepository } from "./agency.repo";
import type { AppEnv } from "@/types";
import { firebaseAuthMiddleware } from "@/middleware";
import { agencySchema } from "./schema";
import { BadRequestError } from "@/errors/http-errors";

const agencyRoutes = new Hono<AppEnv>();

agencyRoutes.get("/", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new AgencyService(new AgencyRepository(db));
  const results = await service.findAll(user);
  return c.json(results);
});

agencyRoutes.get("/:id", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const service = new AgencyService(new AgencyRepository(db));
  const results = await service.findById(c.req.param("id"));
  return c.json(results);
});

agencyRoutes.post("/", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = agencySchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0].message);
  }
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new AgencyService(new AgencyRepository(db));
  const results = await service.create(parsed.data, user);
  return c.json(results);
});

agencyRoutes.put("/:id", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new AgencyService(new AgencyRepository(db));
  const results = await service.update(c.req.param("id"), body, user);
  return c.json(results);
});

agencyRoutes.delete("/:id", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new AgencyService(new AgencyRepository(db));
  const results = await service.delete(c.req.param("id"), user);
  return c.json(results);
});

export default agencyRoutes;
