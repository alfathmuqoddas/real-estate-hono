import { Hono } from "hono";
import { getDb } from "@/db";
import { FavoriteService } from "./favorites.service";
import { FavoriteRepository } from "./favorites.repo";
import type { Bindings, UserContext } from "@/types";
import { firebaseAuthMiddleware } from "@/middleware";
import { favoritesQuerySchema } from "./dto";
import { BadRequestError } from "@/errors/http-errors";

const favoritesRoutes = new Hono<{
  Bindings: Bindings;
  Variables: UserContext;
}>();

favoritesRoutes.post("/:propertyId", firebaseAuthMiddleware, async (c) => {
  const user = c.get("userFirebase");
  const db = getDb(c.env);
  const service = new FavoriteService(new FavoriteRepository(db), db);
  const results = await service.toggleFavorite(
    user.uid,
    c.req.param("propertyId"),
  );
  return c.json(results);
});

favoritesRoutes.get("/all-favorites", firebaseAuthMiddleware, async (c) => {
  const parsedQuery = favoritesQuerySchema.safeParse(c.req.query());
  if (!parsedQuery.success) {
    throw new BadRequestError(parsedQuery.error.issues[0].message);
  }
  const user = c.get("userFirebase");
  const db = getDb(c.env);
  const service = new FavoriteService(new FavoriteRepository(db), db);
  const results = await service.getAllFavorites(user, parsedQuery.data);
  return c.json(results);
});

favoritesRoutes.get("/my-favorites", firebaseAuthMiddleware, async (c) => {
  const parsedQuery = favoritesQuerySchema.safeParse(c.req.query());
  if (!parsedQuery.success) {
    throw new BadRequestError(parsedQuery.error.issues[0].message);
  }
  const user = c.get("userFirebase");
  const db = getDb(c.env);
  const service = new FavoriteService(new FavoriteRepository(db), db);
  const results = await service.getFavoritesByUserId(
    parsedQuery.data,
    user.uid,
  );
  return c.json(results);
});

export default favoritesRoutes;
