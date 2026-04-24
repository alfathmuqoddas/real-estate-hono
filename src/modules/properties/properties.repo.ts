import { CreatePropertyInput, PropertyQuery } from "./dto";
import { propertiesTable } from "./properties.model";
import { eq, sql } from "drizzle-orm";
import { buildPropertyFilters, buildPropertyOrder } from "./query";

export class PropertyRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findAll(query: PropertyQuery) {
    let { page, limit } = query;

    const offset = (page - 1) * limit;

    const where = buildPropertyFilters(query);
    const orderBy = buildPropertyOrder(query);

    const data = await this.db
      .select()
      .from(propertiesTable)
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(propertiesTable)
      .where(where);

    const total = Number(count);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(count / limit),
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

  async create(input: CreatePropertyInput) {
    const [property] = await this.db
      .insert(propertiesTable)
      .values(input)
      .returning();
    return property;
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
