import { PropertyImageRepository as repo } from "./propertyImages.repo";
import type { CreatePropertyImageInput } from "./dto";
import { BadRequestError } from "@/errors/http-errors";
import type { DB } from "@/db";

export const PropertyImageService = {
  async createPropertyImage(
    input: CreatePropertyImageInput[],
    userId: string,
    db: DB,
  ) {
    if (!userId) {
      throw new BadRequestError("User id is required");
    }
    if (input.length === 0) {
      throw new BadRequestError("No images to create");
    }
    if (!Array.isArray(input)) {
      throw new BadRequestError("Body must be an array");
    }
    const result = await repo.create(input, userId, db);

    return { message: `Succesfully created ${result.length} images` };
  },

  async getPropertyImages(propertyId: string, db: DB) {
    if (!propertyId) {
      throw new BadRequestError("Property id is required");
    }
    return await repo.findByPropertyId(propertyId, db);
  },
};
