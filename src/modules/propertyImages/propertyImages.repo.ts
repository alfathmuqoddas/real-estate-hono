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

  async findByPropertyId(propertyId: string, db: DB) {
    return await db.query.propertyImagesTable.findMany({
      where: eq(propertyImagesTable.propertyId, propertyId),
    });
  },
};
