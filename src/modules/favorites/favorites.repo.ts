import { and, eq } from "drizzle-orm";
import { favoritesTable } from "./favorites.model";

export class FavoriteRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findByUserIdAndPropertyId(userId: string, propertyId: string) {
    return await this.db.query.favoritesTable.findFirst({
      where: and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.propertyId, propertyId),
      ),
    });
  }

  async create(userId: string, propertyId: string) {
    return this.db
      .insert(favoritesTable)
      .values({
        userId,
        propertyId,
      })
      .returning();
  }

  async delete(userId: string, propertyId: string) {
    return this.db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.propertyId, propertyId),
        ),
      )
      .returning();
  }
}
