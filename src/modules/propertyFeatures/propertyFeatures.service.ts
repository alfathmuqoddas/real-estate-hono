import { UserContext } from "@/types";
import { PropertyFeaturesRepository } from "./propertyFeatures.repo";
import type { PropertyFeatures } from "./schema";
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from "@/errors/http-errors";

export class PropertyFeaturesService {
  constructor(private repo: PropertyFeaturesRepository) {}

  async findAll() {
    return await this.repo.findAll();
  }

  async findById(id: string) {
    return await this.repo.findById(id);
  }

  async create(input: PropertyFeatures[], user: UserContext["userFirebase"]) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can create property features");
    }

    if (!Array.isArray(input)) {
      throw new Error("Input must be an array");
    }

    await this.repo.create(input);

    return {
      message: `${input.length} record(s) of property features created successfully`,
    };
  }

  async update(
    id: string,
    input: Partial<PropertyFeatures>,
    user: UserContext["userFirebase"],
  ) {
    if (!id) {
      throw new BadRequestError("Property features id is required");
    }

    const propertyFeatures = await this.repo.findById(id);

    if (!propertyFeatures) {
      throw new NotFoundError("Property features not found");
    }

    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can update property features");
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    await this.repo.update(id, input);

    return { message: "Property features updated successfully" };
  }

  async delete(id: string, user: UserContext["userFirebase"]) {
    if (!id) {
      throw new BadRequestError("Property features id is required");
    }

    const propertyFeatures = await this.repo.findById(id);

    if (!propertyFeatures) {
      throw new NotFoundError("Property features not found");
    }

    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can delete property features");
    }

    return await this.repo.delete(id);
  }
}
