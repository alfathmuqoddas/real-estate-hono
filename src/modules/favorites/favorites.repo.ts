import { and, eq, asc, desc, sql } from "drizzle-orm";
import { favoritesTable } from "./favorites.model";
import type { FavoritesQuery } from "./dto";
import type { DB } from "@/db";

export const FavoriteRepository = {
  async findByUserIdAndPropertyId(userId: string, propertyId: string, db: DB) {
    return await db.query.favoritesTable.findFirst({
      where: and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.propertyId, propertyId),
      ),
    });
  },

  async findByUserId(query: FavoritesQuery, userId: string, db: DB) {
    const page = Math.max(1, Number(query.page));
    const limit = Math.min(50, Number(query.limit));

    const offset = (page - 1) * limit;

    const data = await db.query.favoritesTable.findMany({
      limit,
      offset,
      orderBy:
        query.order === "asc"
          ? asc(favoritesTable.createdAt)
          : desc(favoritesTable.createdAt),
      where: eq(favoritesTable.userId, userId),
      columns: {
        id: true,
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
            propertyAddressCity: true,
            propertyAddressProvince: true,
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

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    const rawCount = result[0]?.count ?? 0;
    const total = Number(rawCount);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  },

  async findAll(query: FavoritesQuery, db: DB) {
    const page = Math.max(1, Number(query.page));
    const limit = Math.min(50, Number(query.limit));

    const offset = (page - 1) * limit;

    const data = await db.query.favoritesTable.findMany({
      limit,
      offset,
      orderBy:
        query.order === "asc"
          ? asc(favoritesTable.createdAt)
          : desc(favoritesTable.createdAt),
      columns: {
        id: true,
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
            propertyAddressCity: true,
            propertyAddressProvince: true,
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

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(favoritesTable);

    const rawCount = result[0]?.count ?? 0;
    const total = Number(rawCount);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  },

  async create(userId: string, propertyId: string, db: DB) {
    return db
      .insert(favoritesTable)
      .values({
        userId,
        propertyId,
      })
      .returning();
  },

  async delete(userId: string, propertyId: string, db: DB) {
    return db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.propertyId, propertyId),
        ),
      )
      .returning();
  },
};
