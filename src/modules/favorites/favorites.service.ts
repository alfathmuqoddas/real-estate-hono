import { FavoriteRepository } from "./favorites.repo";
import { BadRequestError } from "@/errors/http-errors";
import type { FavoritesQuery } from "./dto";

export class FavoriteService {
  constructor(
    private repo: FavoriteRepository,
    private db: ReturnType<typeof import("@/db").getDb>,
  ) {}

  async getFavoritesByUserId(query: FavoritesQuery, userId: string) {
    return await this.repo.findByUserId(query, userId);
  }

  async toggleFavorite(userId: string, propertyId: string) {
    if (!userId) {
      throw new BadRequestError("User id is required");
    }

    if (!propertyId) {
      throw new BadRequestError("Property id is required");
    }

    return await this.db.transaction(async (tx) => {
      const existing = await this.repo.findByUserIdAndPropertyId(
        userId,
        propertyId,
      );

      if (existing) {
        await this.repo.delete(userId, propertyId);
        return { status: "removes" };
      }

      await this.repo.create(userId, propertyId);
      return { status: "added" };
    });
  }
}
