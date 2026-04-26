import { CreatePropertyImageInput } from "./dto";
import { propertyImagesTable } from "./propertyImages.model";
import { eq } from "drizzle-orm";

export class PropertyImageRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async create(input: CreatePropertyImageInput[], userId: string) {
    const data = input.map((property) => ({
      ...property,
      userId,
    }));
    return await this.db.insert(propertyImagesTable).values(data).returning();
  }

  async findByPropertyId(propertyId: string) {
    return await this.db.query.propertyImagesTable.findMany({
      where: eq(propertyImagesTable.propertyId, propertyId),
    });
  }
}
