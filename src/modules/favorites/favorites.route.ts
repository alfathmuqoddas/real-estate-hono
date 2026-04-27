import { Hono } from "hono";
import { getDb } from "@/db";
import { FavoriteService } from "./favorites.service";
import { FavoriteRepository } from "./favorites.repo";
import type { Bindings, UserContext } from "@/types";
import { firebaseAuthMiddleware } from "@/middleware";

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

export default favoritesRoutes;
