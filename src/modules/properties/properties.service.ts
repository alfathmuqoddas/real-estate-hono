import { PropertyRepository } from "./properties.repo";
import type { CreatePropertyInput } from "./dto";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "@/errors/http-errors";
import type { PropertyQuery } from "./dto";

export class PropertiesService {
  constructor(private repo: PropertyRepository) {}

  async createProperty(input: CreatePropertyInput) {
    await this.repo.create(input);
  }

  async getAllProperties(query: PropertyQuery) {
    if (!query.province) {
      throw new BadRequestError("Province is required");
    }
    const normalized = {
      ...query,
      page: Math.max(query.page ?? 1, 1),
      limit: Math.min(query.limit ?? 10, 50),
      sortBy: query.sortBy ?? "createdAt",
      order: query.order ?? "desc",
    };
    await this.repo.findAll(normalized);
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
