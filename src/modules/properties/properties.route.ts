import { Hono } from "hono";
import { getDb } from "@/db";
import { PropertiesService as service } from "./properties.service";
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
  const results = await service.getAllProperties(parsed.data, db, user?.uid);
  return c.json(results);
});

propertyRoutes.get("/my-properties", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const query = c.req.query();
  const parsed = propertyQuerySchema.safeParse(query);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0].message);
  }
  const user = c.get("userFirebase");
  const results = await service.getMyProperties(
    user.role,
    parsed.data,
    user.uid,
    db,
  );
  return c.json(results);
});

propertyRoutes.get("/:id", firebaseAuthOptionalMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const results = await service.getPropertyById(
    c.req.param("id"),
    db,
    user?.uid,
  );
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
  const results = await service.createProperty(parsed.data, user, db);
  return c.json(results);
});

propertyRoutes.put("/bulk", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const userContext = c.get("userFirebase");
  const results = await service.bulkUpdateProperties(userContext, body, db);
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
  const results = await service.updateProperty(
    c.req.param("id"),
    parsed.data,
    userContext,
    db,
  );
  return c.json(results);
});

propertyRoutes.delete("/:id", firebaseAuthMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get("userFirebase");
  const results = await service.deleteProperty(c.req.param("id"), user, db);
  return c.json(results);
});

export default propertyRoutes;
