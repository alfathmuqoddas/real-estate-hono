import { eq } from "drizzle-orm";
import { propertyFeaturesTable } from "./propertyFeatures.model";
import type { PropertyFeatures } from "./schema";

export class PropertyFeaturesRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findAll() {
    return await this.db.query.propertyFeaturesTable.findMany();
  }

  async findById(id: string) {
    return await this.db.query.propertyFeaturesTable.findFirst({
      where: eq(propertyFeaturesTable.id, Number(id)),
    });
  }

  async create(input: PropertyFeatures[]) {
    return await this.db
      .insert(propertyFeaturesTable)
      .values(input)
      .returning();
  }

  async update(id: string, input: Partial<PropertyFeatures>) {
    return await this.db
      .update(propertyFeaturesTable)
      .set(input)
      .where(eq(propertyFeaturesTable.id, Number(id)))
      .returning();
  }

  async delete(id: string) {
    return await this.db
      .delete(propertyFeaturesTable)
      .where(eq(propertyFeaturesTable.id, Number(id)))
      .returning();
  }
}
