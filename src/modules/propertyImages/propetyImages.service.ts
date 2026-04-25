import { PropertyImageRepository } from "./propertyImages.repo";
import type { CreatePropertyImageInput } from "./dto";
import { BadRequestError } from "@/errors/http-errors";

export class PropertyImageService {
  constructor(private repo: PropertyImageRepository) {}

  async createPropertyImage(input: CreatePropertyImageInput[], userId: string) {
    if (!userId) {
      throw new BadRequestError("User id is required");
    }
    if (input.length === 0) {
      throw new BadRequestError("No images to create");
    }
    if (!Array.isArray(input)) {
      throw new BadRequestError("Body must be an array");
    }
    const result = await this.repo.create(input, userId);

    return { message: `Succesfully created ${result.length} images` };
  }
}
