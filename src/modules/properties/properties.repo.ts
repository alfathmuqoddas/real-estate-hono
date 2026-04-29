import { CreatePropertyInput, PropertyQuery } from "./dto";
import { propertiesTable } from "./properties.model";
import { eq, sql, inArray } from "drizzle-orm";
import { buildPropertyFilters, buildPropertyOrder } from "./query";

export class PropertyRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findAll(query: PropertyQuery, userId?: string) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(50, Number(query.limit ?? 10));

    const offset = (page - 1) * limit;

    const where = buildPropertyFilters(query);
    const orderBy = buildPropertyOrder(query);

    const data = await this.db.query.propertiesTable.findMany({
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
      },
    });

    const result = await this.db
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
  }

  async findById(id: string, userId?: string) {
    return await this.db.query.propertiesTable.findFirst({
      where: eq(propertiesTable.id, id),
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
        favorites: userId
          ? {
              where: (fav, { eq }) => eq(fav.userId, userId),
              columns: { id: true },
            }
          : undefined,
        features: {
          with: {
            feature: true,
          },
        },
      },
    });
  }

  async create(input: CreatePropertyInput[], userId: string) {
    const data = input.map((property) => ({
      ...property,
      propertyAgentId: userId,
    }));
    return await this.db.insert(propertiesTable).values(data).returning();
  }

  async update(id: string, input: Partial<CreatePropertyInput>) {
    const [property] = await this.db
      .update(propertiesTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(propertiesTable.id, id))
      .returning();
    return property;
  }

  async bulkUpdate(inputs: (Partial<CreatePropertyInput> & { id: string })[]) {
    return await this.db.transaction(async (tx) => {
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
  }

  async delete(id: string) {
    const [property] = await this.db
      .delete(propertiesTable)
      .where(eq(propertiesTable.id, id))
      .returning();
    return property;
  }
}
