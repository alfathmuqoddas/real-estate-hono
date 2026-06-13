import { PropertyRepository } from "./properties.repo";
import type { CreatePropertyInput } from "./dto";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "@/errors/http-errors";
import type { PropertyQuery } from "./dto";
import { UserContext } from "@/types";

export class PropertiesService {
  constructor(private repo: PropertyRepository) {}

  async createProperty(
    input: CreatePropertyInput,
    user: UserContext["userFirebase"],
  ) {
    if (!user.uid) throw new BadRequestError("User id is required");
    //must be admin or agent role
    if (user.role !== "admin" && user.role !== "agent") {
      throw new ForbiddenError("Only admins or agent can create properties");
    }

    await this.repo.create(input, user.uid, input.propertyFeatures);
    return { message: `Succesfully created property` };
  }

  async getAllProperties(query: PropertyQuery, userId?: string) {
    const normalized = {
      ...query,
      page: Math.max(query.page ?? 1, 1),
      limit: Math.min(query.limit ?? 10, 50),
      sortBy: query.sortBy ?? "createdAt",
      order: query.order ?? "desc",
    };
    return await this.repo.findAll(normalized, userId);
  }

  async getPropertyById(id: string, userId?: string) {
    if (!id) {
      throw new BadRequestError("Property id is required");
    }
    const result = await this.repo.findById(id, userId);
    if (!result) {
      throw new NotFoundError("Property not found");
    }
    return result;
  }

  async getMyProperties(
    role: UserContext["userFirebase"]["role"],
    query: { page?: number; limit?: number },
    userId: string,
  ) {
    if (role !== "admin" && role !== "agent") {
      throw new ForbiddenError("Only admins or agent can access");
    }

    return await this.repo.findMyProperties(query, userId);
  }

  async updateProperty(
    id: string,
    input: Partial<CreatePropertyInput>,
    user: UserContext["userFirebase"],
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
      return await this.repo.update(id, input, input.propertyFeatures);
    }

    if (property.propertyAgentId !== user.uid) {
      throw new ForbiddenError(
        "You are not authorized to update this property",
      );
    }

    return await this.repo.update(id, input, input.propertyFeatures);
  }

  async bulkUpdateProperties(
    user: UserContext["userFirebase"],
    inputs: (Partial<CreatePropertyInput> & { id: string })[],
  ) {
    if (!inputs.length) {
      throw new BadRequestError("No properties to update");
    }

    if (inputs.some((input) => !input.id)) {
      throw new BadRequestError("All inputs must have an id");
    }

    if (!Array.isArray(inputs)) {
      throw new BadRequestError("Body must be an array");
    }

    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can update properties");
    }
    return await this.repo.bulkUpdate(inputs);
  }

  async deleteProperty(id: string, user: UserContext["userFirebase"]) {
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
