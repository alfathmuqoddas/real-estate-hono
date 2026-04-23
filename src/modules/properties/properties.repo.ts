import { CreatePropertyInput } from "./dto";
import { propertiesTable } from "./properties.model";
import { eq } from "drizzle-orm";

export class PropertyRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findAll() {
    try {
      return await this.db.select().from(propertiesTable);
    } catch (error) {
      console.error("GET ALL PROPERTIES SERVICE ERROR:", error);
      throw new Error("Failed to get all properties");
    }
  }

  async findById(id: string) {
    if (!id) {
      throw new Error("Property id is required");
    }

    try {
      return await this.db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.id, id));
    } catch (error) {
      console.error("GET PROPERTY BY ID SERVICE ERROR:", error);
      throw new Error("Failed to get property by id");
    }
  }

  async create(input: CreatePropertyInput) {
    try {
      return await this.db.insert(propertiesTable).values(input).run();
    } catch (error) {
      console.error("CREATE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to create property");
    }
  }

  async update(id: string, input: Partial<CreatePropertyInput>) {
    try {
      return await this.db
        .update(propertiesTable)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(propertiesTable.id, id))
        .run();
    } catch (error) {
      console.error("UPDATE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to update property");
    }
  }

  async delete(id: string) {
    try {
      return await this.db
        .delete(propertiesTable)
        .where(eq(propertiesTable.id, id))
        .returning();
    } catch (error) {
      console.error("DELETE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to delete property");
    }
  }
}
