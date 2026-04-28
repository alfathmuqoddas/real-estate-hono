import { and, eq, asc, desc } from "drizzle-orm";
import { favoritesTable } from "./favorites.model";
import type { FavoritesQuery } from "./dto";

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

  async findByUserId(query: FavoritesQuery, userId: string) {
    const page = Math.max(1, Number(query.page));
    const limit = Math.min(50, Number(query.limit));

    const offset = (page - 1) * limit;

    return await this.db.query.favoritesTable.findMany({
      limit,
      offset,
      orderBy:
        query.order === "asc"
          ? asc(favoritesTable.createdAt)
          : desc(favoritesTable.createdAt),
      where: eq(favoritesTable.userId, userId),
      columns: {
        id: true,
        propertyId: true,
        createdAt: true,
      },
      with: {
        property: {
          columns: {
            id: true,
            propertyTitle: true,
            propertyDeskripsi: true,
            propertyPrice: true,
            propertyKamarMandi: true,
            propertyKamarTidur: true,
            propertyLuasTanah: true,
            propertyLuasBangunan: true,
            propertyType: true,
            propertyListingType: true,
            isFavorite: true,
            createdAt: true,
          },
          with: {
            owner: {
              columns: {
                id: true,
                email: true,
                name: true,
                photoUrl: true,
              },
            },
            images: {
              columns: {
                id: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: FavoritesQuery) {
    const page = Math.max(1, Number(query.page));
    const limit = Math.min(50, Number(query.limit));

    const offset = (page - 1) * limit;

    return await this.db.query.favoritesTable.findMany({
      limit,
      offset,
      orderBy:
        query.order === "asc"
          ? asc(favoritesTable.createdAt)
          : desc(favoritesTable.createdAt),
      columns: {
        id: true,
        propertyId: true,
        createdAt: true,
      },
      with: {
        property: {
          columns: {
            id: true,
            propertyTitle: true,
            propertyDeskripsi: true,
            propertyPrice: true,
            propertyKamarMandi: true,
            propertyKamarTidur: true,
            propertyLuasTanah: true,
            propertyLuasBangunan: true,
            propertyType: true,
            propertyListingType: true,
            isFavorite: true,
            createdAt: true,
          },
          with: {
            owner: {
              columns: {
                id: true,
                email: true,
                name: true,
                photoUrl: true,
              },
            },
            images: {
              columns: {
                id: true,
                imageUrl: true,
              },
            },
          },
        },
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
          },
        },
      },
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
