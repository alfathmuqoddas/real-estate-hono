import { Hono } from "hono";
import { getDb } from "@/db";
import { PropertiesService } from "./properties.service";
import { PropertyRepository } from "./properties.repo";
import type { AppEnv } from "@/types";
import {
  firebaseAuthMiddleware,
  firebaseAuthOptionalMiddleware,
} from "@/middleware";
import {
  createPropertyInputSchema,
  updatePropertyInputSchema,
  propertyQuerySchema,
} from "./dto";
import { BadRequestError } from "@/errors/http-errors";

const propertyRoutes = new Hono<AppEnv>();

propertyRoutes.get("/", firebaseAuthOptionalMiddleware, async (c) => {
  const query = c.req.query();
  const user = c.get("userFirebase");
  const parsed = propertyQuerySchema.safeParse(query);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0].message);
  }
  const db = getDb(c.env);
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.getAllProperties(parsed.data, user?.uid);
  return c.json(results);
});

propertyRoutes.get("/:id", firebaseAuthOptionalMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.getPropertyById(c.req.param("id"), user?.uid);
  return c.json(results);
});

propertyRoutes.post("/", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = createPropertyInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0].message);
  }
  const user = c.get("userFirebase");
  const db = getDb(c.env);
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.createProperty(parsed.data, user);
  return c.json(results);
});

propertyRoutes.put("/bulk", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const userContext = c.get("userFirebase");
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.bulkUpdateProperties(userContext, body);
  return c.json(results);
});

propertyRoutes.put("/:id", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = updatePropertyInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0].message);
  }
  const db = getDb(c.env);
  const userContext = c.get("userFirebase");
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.updateProperty(
    c.req.param("id"),
    body,
    userContext,
  );
  return c.json(results);
});

propertyRoutes.delete("/:id", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.deleteProperty(c.req.param("id"), user);
  return c.json(results);
});

export default propertyRoutes;
