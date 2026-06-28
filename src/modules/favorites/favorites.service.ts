import { FavoriteRepository as repo } from "./favorites.repo";
import { BadRequestError } from "@/errors/http-errors";
import type { FavoritesQuery } from "./dto";
import type { UserContext } from "@/types";
import { ForbiddenError } from "@/errors/http-errors";
import type { DB } from "@/db";

export const FavoritesService = {
  async getAllFavorites(
    user: UserContext["userFirebase"],
    query: FavoritesQuery,
    db: DB,
  ) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can view all favorites");
    }
    return await repo.findAll(query, db);
  },

  async getFavoritesByUserId(query: FavoritesQuery, userId: string, db: DB) {
    return await repo.findByUserId(query, userId, db);
  },

  async toggleFavorite(userId: string, propertyId: string, db: DB) {
    if (!userId) {
      throw new BadRequestError("User id is required");
    }

    if (!propertyId) {
      throw new BadRequestError("Property id is required");
    }

    return await db.transaction(async (tx) => {
      const existing = await repo.findByUserIdAndPropertyId(
        userId,
        propertyId,
        db,
      );

      if (existing) {
        await repo.delete(userId, propertyId, db);
        return { status: "removes" };
      }

      await repo.create(userId, propertyId, db);
      return { status: "added" };
    });
  },
};
