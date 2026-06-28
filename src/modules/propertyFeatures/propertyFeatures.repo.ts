import { eq } from "drizzle-orm";
import { propertyFeaturesTable } from "./propertyFeatures.model";
import type { PropertyFeatures } from "./schema";
import type { DB } from "@/db";

export const PropertyFeaturesRepository = {
  async findAll(db: DB) {
    return await db.query.propertyFeaturesTable.findMany();
  },

  async findById(id: string, db: DB) {
    return await db.query.propertyFeaturesTable.findFirst({
      where: eq(propertyFeaturesTable.id, Number(id)),
    });
  },

  async create(input: PropertyFeatures[], db: DB) {
    return await db.insert(propertyFeaturesTable).values(input).returning();
  },

  async update(id: string, input: Partial<PropertyFeatures>, db: DB) {
    return await db
      .update(propertyFeaturesTable)
      .set(input)
      .where(eq(propertyFeaturesTable.id, Number(id)))
      .returning();
  },

  async delete(id: string, db: DB) {
    return await db
      .delete(propertyFeaturesTable)
      .where(eq(propertyFeaturesTable.id, Number(id)))
      .returning();
  },
};
