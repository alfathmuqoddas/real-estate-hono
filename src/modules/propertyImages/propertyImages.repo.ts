import { CreatePropertyImageInput } from "./dto";
import { propertyImagesTable } from "./propertyImages.model";

export class PropertyImageRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async create(input: CreatePropertyImageInput[], userId: string) {
    const data = input.map((property) => ({
      ...property,
      userId,
    }));
    return await this.db.insert(propertyImagesTable).values(data).returning();
  }
}
