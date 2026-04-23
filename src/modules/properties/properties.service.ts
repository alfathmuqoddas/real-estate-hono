import { db } from "@/db";
import { propertiesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CreatePropertyInput } from "./dto";

export const propertiesService = {
  createProperty: async (input: CreatePropertyInput) => {
    try {
      const result = await db.insert(propertiesTable).values(input).returning();

      return result[0];
    } catch (error) {
      console.error("CREATE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to create property");
    }
  },
  getAllProperties: async () => {
    try {
      const result = await db.select().from(propertiesTable);
      return result;
    } catch (error) {
      console.error("GET ALL PROPERTIES SERVICE ERROR:", error);
      throw new Error("Failed to get all properties");
    }
  },
  getPropertyById: async (id: string) => {
    if (!id) {
      throw new Error("Property id is required");
    }
    try {
      const result = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.id, id));
      return result[0];
    } catch (error) {
      console.error("GET PROPERTY BY ID SERVICE ERROR:", error);
      throw new Error("Failed to get property by id");
    }
  },
  updateProperty: async (id: string, input: Partial<CreatePropertyInput>) => {
    if (!id) {
      throw new Error("Property id is required");
    }
    if (Object.keys(input).length === 0) {
      throw new Error("No fields to update");
    }
    try {
      const result = await db
        .update(propertiesTable)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(propertiesTable.id, id))
        .returning();
      return result[0] ?? null;
    } catch (error) {
      console.error("UPDATE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to update property");
    }
  },
  deleteProperty: async (id: string) => {
    if (!id) {
      throw new Error("Property id is required");
    }
    try {
      const result = await db
        .delete(propertiesTable)
        .where(eq(propertiesTable.id, id))
        .returning();

      return result[0] ?? null;
    } catch (error) {
      console.error("DELETE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to delete property");
    }
  },
};
