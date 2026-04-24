import { PropertyRepository } from "./properties.repo";
import type { CreatePropertyInput } from "./dto";
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from "@/errors/http-errors";

export class PropertiesService {
  constructor(private repo: PropertyRepository) {}

  async createProperty(input: CreatePropertyInput) {
    await this.repo.create(input);
  }

  async getAllProperties() {
    await this.repo.findAll();
  }

  async getPropertyById(id: string) {
    if (!id) {
      throw new BadRequestError("Property id is required");
    }
    const result = await this.repo.findById(id);
    if (!result) {
      throw new NotFoundError("Property not found");
    }
    return result;
  }

  async updateProperty(
    id: string,
    input: Partial<CreatePropertyInput>,
    user: { uid: string; role: string },
  ) {
    if (!id) {
      throw new BadRequestError("Property id is required");
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    const property = await this.repo.findById(id);

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    if (user.role === "user") {
      throw new ForbiddenError("User cannot update properties");
    }

    if (user.role === "admin") {
      // Admins can update any property
      return await this.repo.update(id, input);
    }

    if (property.propertyAgentId !== user.uid) {
      throw new ForbiddenError(
        "You are not authorized to update this property",
      );
    }

    return await this.repo.update(id, input);
  }

  async deleteProperty(id: string, user: { uid: string; role: string }) {
    if (!id) {
      throw new BadRequestError("Property id is required");
    }

    const property = await this.repo.findById(id);

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    if (user.role === "user") {
      throw new ForbiddenError("User cannot delete properties");
    }

    if (user.role === "admin") {
      return this.repo.delete(id);
    }

    if (property.propertyAgentId !== user.uid) {
      throw new ForbiddenError("You are not allowed to delete this property");
    }

    return this.repo.delete(id);
  }
}
