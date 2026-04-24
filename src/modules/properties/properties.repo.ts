import { CreatePropertyInput } from "./dto";
import { propertiesTable } from "./properties.model";
import { eq } from "drizzle-orm";

export class PropertyRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findAll() {
    return await this.db.select().from(propertiesTable);
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
