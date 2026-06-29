import { CreatePropertyImageInput } from "./dto";
import { propertyImagesTable } from "./propertyImages.model";
import { eq } from "drizzle-orm";
import type { DB } from "@/db";

export const PropertyImageRepository = {
  async create(input: CreatePropertyImageInput[], userId: string, db: DB) {
    const data = input.map((property) => ({
      ...property,
      userId,
    }));
    return await db.insert(propertyImagesTable).values(data).returning();
  },

  async delete(id: string, db: DB) {
    return await db
      .delete(propertyImagesTable)
      .where(eq(propertyImagesTable.id, id))
      .returning();
  },

  async findAll(db: DB) {
    return await db.query.propertyImagesTable.findMany();
  },

  async findById(id: string, db: DB) {
    return await db.query.propertyImagesTable.findFirst({
      where: eq(propertyImagesTable.id, id),
    });
  },

  async findByUserId(userId: string, db: DB) {
    const where = eq(propertyImagesTable.userId, userId);
    return await db.query.propertyImagesTable.findMany({
      where,
    });
  },

  async findByPropertyId(propertyId: string, db: DB) {
    return await db.query.propertyImagesTable.findMany({
      where: eq(propertyImagesTable.propertyId, propertyId),
    });
  },
};
