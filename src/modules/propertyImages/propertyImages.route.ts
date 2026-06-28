import { Hono } from "hono";
import { getDb } from "@/db";
import { PropertyImageService as service } from "./propetyImages.service";
import type { AppEnv } from "@/types";
import { firebaseAuthMiddleware } from "@/middleware";
import { createPropertyImageInputSchema } from "./dto";
import { BadRequestError } from "@/errors/http-errors";

const propertyImagesRoutes = new Hono<AppEnv>();

propertyImagesRoutes.post("/", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = createPropertyImageInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0].message);
  }
  const user = c.get("userFirebase");
  const db = getDb(c.env);
  const results = await service.createPropertyImage(parsed.data, user.uid, db);
  return c.json(results);
});

propertyImagesRoutes.get("/:propertyId", async (c) => {
  const db = getDb(c.env);
  const results = await service.getPropertyImages(
    c.req.param("propertyId"),
    db,
  );
  return c.json(results);
});

export default propertyImagesRoutes;
