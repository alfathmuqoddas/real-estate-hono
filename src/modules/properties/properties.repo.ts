import { CreatePropertyInput, PropertyQuery } from "./dto";
import { propertiesTable } from "./properties.model";
import { eq, sql } from "drizzle-orm";
import { buildPropertyFilters, buildPropertyOrder } from "./query";

export class PropertyRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findAll(query: PropertyQuery) {
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

  async findById(id: string) {
    return await this.db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, id))
      .get();
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

  async delete(id: string) {
    const [property] = await this.db
      .delete(propertiesTable)
      .where(eq(propertiesTable.id, id))
      .returning();
    return property;
  }
}
