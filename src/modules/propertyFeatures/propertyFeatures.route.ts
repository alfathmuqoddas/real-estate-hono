import { Hono } from "hono";
import { getDb } from "@/db";
import { PropertyFeaturesService } from "./propertyFeatures.service";
import { PropertyFeaturesRepository } from "./propertyFeatures.repo";
import type { AppEnv } from "@/types";
import { firebaseAuthMiddleware } from "@/middleware";
import { propertyFeaturesSchema } from "./schema";

const propertyFeaturesRoutes = new Hono<AppEnv>();

propertyFeaturesRoutes.get("/", async (c) => {
  const db = getDb(c.env);
  const service = new PropertyFeaturesService(
    new PropertyFeaturesRepository(db),
  );
  const results = await service.findAll();
  return c.json(results);
});

propertyFeaturesRoutes.get("/:id", async (c) => {
  const db = getDb(c.env);
  const service = new PropertyFeaturesService(
    new PropertyFeaturesRepository(db),
  );
  const results = await service.findById(c.req.param("id"));
  return c.json(results);
});

propertyFeaturesRoutes.post("/", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = propertyFeaturesSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new PropertyFeaturesService(
    new PropertyFeaturesRepository(db),
  );
  const results = await service.create(parsed.data, user);
  return c.json(results);
});

propertyFeaturesRoutes.put("/:id", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new PropertyFeaturesService(
    new PropertyFeaturesRepository(db),
  );
  const results = await service.update(c.req.param("id"), body, user);
  return c.json(results);
});

propertyFeaturesRoutes.delete("/:id", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new PropertyFeaturesService(
    new PropertyFeaturesRepository(db),
  );
  const results = await service.delete(c.req.param("id"), user);
  return c.json(results);
});

export default propertyFeaturesRoutes;
