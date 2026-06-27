import { CreatePropertyInput, PropertyQuery } from "./dto";
import { propertiesTable } from "./properties.model";
import { propertyToFeatures } from "../propertyFeatures/propertyFeatures.model";
import { eq, sql, desc } from "drizzle-orm";
import { buildPropertyFilters, buildPropertyOrder } from "./query";

type DB = ReturnType<typeof import("@/db").getDb>;

export const PropertyRepository = {
  async findMyProperties(
    query: { page?: number; limit?: number },
    userId: string,
    db: DB,
  ) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(50, Number(query.limit ?? 10));

    const offset = (page - 1) * limit;

    const where = eq(propertiesTable.propertyAgentId, userId);
    const orderBy = desc(propertiesTable.createdAt);
    const data = await db.query.propertiesTable.findMany({
      where,
      orderBy,
      limit,
      offset,
      columns: {
        id: true,
        propertyDeskripsi: true,
        propertyTitle: true,
        propertyType: true,
        propertyListingType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(propertiesTable)
      .where(where);

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

  async findAll(query: PropertyQuery, db: DB, userId?: string) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(50, Number(query.limit ?? 10));

    const offset = (page - 1) * limit;

    const where = buildPropertyFilters(query);
    const orderBy = buildPropertyOrder(query);

    const data = await db.query.propertiesTable.findMany({
      where,
      orderBy,
      limit,
      offset,
      columns: {
        id: true,
        propertyAddressProvince: true,
        propertyDeskripsi: true,
        propertyTitle: true,
        propertyAddressCity: true,
        propertyPrice: true,
        propertyKamarMandi: true,
        propertyKamarTidur: true,
        propertyLuasTanah: true,
        propertyLuasBangunan: true,
        propertyType: true,
        propertyListingType: true,
        //how?
        isFavorite: true,
        createdAt: true,
      },
      with: {
        owner: {
          with: {
            agency: {
              columns: {
                id: true,
                agencyName: true,
                logoUrl: true,
              },
            },
          },
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
        favorites: userId
          ? {
              where: (fav, { eq }) => eq(fav.userId, userId),
              columns: { id: true },
            }
          : undefined,
        features: {
          columns: {
            propertyId: false,
            featureId: false,
          },
          with: {
            feature: {
              columns: {
                id: true,
                featureName: true,
                featureIcon: true,
              },
            },
          },
        },
      },
    });

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(propertiesTable)
      .where(where);

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

  async findById(id: string, db: DB, userId?: string) {
    return await db.query.propertiesTable.findFirst({
      where: eq(propertiesTable.id, id),
      with: {
        owner: {
          with: {
            agency: {
              columns: {
                id: true,
                agencyName: true,
                logoUrl: true,
              },
            },
          },
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
        favorites: userId
          ? {
              where: (fav, { eq }) => eq(fav.userId, userId),
              columns: { id: true },
            }
          : undefined,
        features: {
          columns: {
            propertyId: false,
            featureId: false,
          },
          with: {
            feature: {
              columns: {
                id: true,
                featureName: true,
                featureIcon: true,
              },
            },
          },
        },
      },
    });
  },

  async createBulk(input: CreatePropertyInput[], userId: string, db: DB) {
    const data = input.map((property) => ({
      ...property,
      propertyAgentId: userId,
    }));

    return await db.insert(propertiesTable).values(data).returning();
  },

  async create(
    input: CreatePropertyInput,
    userId: string,
    db: DB,
    propertyFeatures?: string[],
  ) {
    return await db.transaction(async (tx) => {
      const [property] = await tx
        .insert(propertiesTable)
        .values({ ...input, propertyAgentId: userId })
        .returning();

      if (propertyFeatures && propertyFeatures.length > 0) {
        const propertyFeaturesData = propertyFeatures?.map((featureId) => ({
          propertyId: property.id,
          featureId: featureId,
        }));

        await tx.insert(propertyToFeatures).values(propertyFeaturesData);
      }

      return property;
    });
  },

  async update(
    id: string,
    input: Partial<CreatePropertyInput>,
    db: DB,
    propertyFeatures?: string[],
  ) {
    return await db.transaction(async (tx) => {
      const [property] = await tx
        .update(propertiesTable)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(propertiesTable.id, id))
        .returning();

      if (!property) {
        tx.rollback();
        return null;
      }

      if (propertyFeatures !== undefined) {
        await tx
          .delete(propertyToFeatures)
          .where(eq(propertyToFeatures.propertyId, id));

        if (propertyFeatures.length > 0) {
          const featureData = propertyFeatures.map((fId) => ({
            propertyId: id,
            featureId: fId,
          }));

          await tx.insert(propertyToFeatures).values(featureData);
        }
      }

      return property;
    });
  },

  async bulkUpdate(
    inputs: (Partial<CreatePropertyInput> & { id: string })[],
    db: DB,
  ) {
    return await db.transaction(async (tx) => {
      const promises = inputs.map((input) => {
        const { id, ...updateData } = input;

        return tx
          .update(propertiesTable)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(propertiesTable.id, id))
          .returning();
      });

      const results = await Promise.all(promises);
      return results.flat();
    });
  },

  async delete(id: string, db: DB) {
    const [property] = await db
      .delete(propertiesTable)
      .where(eq(propertiesTable.id, id))
      .returning();
    return property;
  },
};
