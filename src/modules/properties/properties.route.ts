import { Hono } from "hono";
import { getDb } from "@/db";
import { PropertiesService } from "./properties.service";
import { PropertyRepository } from "./properties.repo";
import type { Bindings, UserContext } from "@/types";

const propertyRoutes = new Hono<{
  Bindings: Bindings;
  Variables: UserContext;
}>();

propertyRoutes.get("/", async (c) => {
  try {
    const db = getDb(c.env);
    const service = new PropertiesService(new PropertyRepository(db));
    const results = await service.getAllProperties();
    return c.json(results);
  } catch (error) {
    console.error("PROPERTY ROUTES ERROR:", error);
    return c.json({ message: "Failed to get all properties" }, 500);
  }
});

propertyRoutes.get("/:id", async (c) => {
  try {
    const db = getDb(c.env);
    const service = new PropertiesService(new PropertyRepository(db));
    const results = await service.getPropertyById(c.req.param("id"));
    return c.json(results);
  } catch (error) {
    console.error("PROPERTY ROUTES ERROR:", error);
    return c.json({ message: "Failed to get property by id" }, 500);
  }
});

propertyRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const db = getDb(c.env);
    const service = new PropertiesService(new PropertyRepository(db));
    const results = await service.createProperty(body);
    return c.json(results);
  } catch (error) {
    console.error("PROPERTY ROUTES ERROR:", error);
    return c.json({ message: "Failed to create property" }, 500);
  }
});

propertyRoutes.put("/:id", async (c) => {
  try {
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
  } catch (error) {
    console.error("PROPERTY ROUTES ERROR:", error);
    return c.json({ message: "Failed to update property" }, 500);
  }
});

propertyRoutes.delete("/:id", async (c) => {
  try {
    const db = getDb(c.env);
    const user = c.get("user");
    const service = new PropertiesService(new PropertyRepository(db));
    const results = await service.deleteProperty(c.req.param("id"), user);
    return c.json(results);
  } catch (error) {
    console.error("PROPERTY ROUTES ERROR:", error);
    return c.json({ message: "Failed to delete property" }, 500);
  }
});

export default propertyRoutes;
