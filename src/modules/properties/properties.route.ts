import { Hono } from "hono";
import { getDb } from "@/db";
import { PropertiesService } from "./properties.service";
import { PropertyRepository } from "./properties.repo";
import type { Bindings, UserContext } from "@/types";
import { firebaseAuthMiddleware } from "@/middleware/firebaseAuth";

const propertyRoutes = new Hono<{
  Bindings: Bindings;
  Variables: UserContext;
}>();

propertyRoutes.get("/", async (c) => {
  const db = getDb(c.env);
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.getAllProperties();
  return c.json(results);
});

propertyRoutes.get("/:id", async (c) => {
  const db = getDb(c.env);
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.getPropertyById(c.req.param("id"));
  return c.json(results);
});

propertyRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.createProperty(body);
  return c.json(results);
});

propertyRoutes.put("/:id", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env);
  const userContext = c.get("user");
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
  const user = c.get("user");
  const service = new PropertiesService(new PropertyRepository(db));
  const results = await service.deleteProperty(c.req.param("id"), user);
  return c.json(results);
});

export default propertyRoutes;
