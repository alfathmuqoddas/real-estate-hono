import { Hono } from "hono";
import { getDb } from "@/db";
import { PropertyImageService } from "./propetyImages.service";
import { PropertyImageRepository } from "./propertyImages.repo";
import type { Bindings, UserContext } from "@/types";
import { firebaseAuthMiddleware } from "@/middleware";
import { createPropertyImageInputSchema } from "./dto";
import { BadRequestError } from "@/errors/http-errors";

const propertyImagesRoutes = new Hono<{
  Bindings: Bindings;
  Variables: UserContext;
}>();

propertyImagesRoutes.post("/", firebaseAuthMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = createPropertyImageInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues[0].message);
  }
  const user = c.get("userFirebase");
  const db = getDb(c.env);
  const service = new PropertyImageService(new PropertyImageRepository(db));
  const results = await service.createPropertyImage(parsed.data, user.uid);
  return c.json(results);
});

export default propertyImagesRoutes;
