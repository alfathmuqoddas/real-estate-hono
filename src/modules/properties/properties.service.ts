import { PropertyRepository as repo } from "./properties.repo";
import type { CreatePropertyInput } from "./dto";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "@/errors/http-errors";
import type { PropertyQuery } from "./dto";
import { UserContext } from "@/types";
import type { DB } from "@/db";

export const PropertiesService = {
  async createProperty(
    input: CreatePropertyInput,
    user: UserContext["userFirebase"],
    db: DB,
  ) {
    if (!user.uid) throw new BadRequestError("User id is required");
    if (user.role !== "admin" && user.role !== "agent") {
      throw new ForbiddenError("Only admins or agent can create properties");
    }

    await repo.create(input, user.uid, db, input.propertyFeatures);
    return { message: `Succesfully created property` };
  },

  async getAllProperties(query: PropertyQuery, db: DB, userId?: string) {
    const normalized = {
      ...query,
      page: Math.max(query.page ?? 1, 1),
      limit: Math.min(query.limit ?? 10, 50),
      sortBy: query.sortBy ?? "createdAt",
      order: query.order ?? "desc",
    };
    return await repo.findAll(normalized, db, userId);
  },

  async getPropertyById(id: string, db: DB, userId?: string) {
    if (!id) {
      throw new BadRequestError("Property id is required");
    }
    const result = await repo.findById(id, db, userId);
    if (!result) {
      throw new NotFoundError("Property not found");
    }
    return result;
  },

  async getMyProperties(
    role: UserContext["userFirebase"]["role"],
    query: { page?: number; limit?: number },
    userId: string,
    db: DB,
  ) {
    if (role !== "admin" && role !== "agent") {
      throw new ForbiddenError("Only admins or agent can access");
    }

    return await repo.findMyProperties(query, userId, db);
  },

  async updateProperty(
    id: string,
    input: Partial<CreatePropertyInput>,
    user: UserContext["userFirebase"],
    db: DB,
  ) {
    if (!id) {
      throw new BadRequestError("Property id is required");
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    const property = await repo.findById(id, db);

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const isAdmin = user.role === "admin";
    const isAgentOwner =
      user.role === "agent" && property.propertyAgentId === user.uid;

    if (!isAdmin && !isAgentOwner) {
      throw new ForbiddenError(
        "You are not authorized to update this property",
      );
    }

    return await repo.update(id, input, db, input.propertyFeatures);
  },

  async bulkUpdateProperties(
    user: UserContext["userFirebase"],
    inputs: (Partial<CreatePropertyInput> & { id: string })[],
    db: DB,
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
    return await repo.bulkUpdate(inputs, db);
  },

  async deleteProperty(id: string, user: UserContext["userFirebase"], db: DB) {
    if (!id) {
      throw new BadRequestError("Property id is required");
    }

    const property = await repo.findById(id, db);

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const isAdmin = user.role === "admin";
    const isAgentOwner =
      user.role === "agent" && property.propertyAgentId === user.uid;

    if (!isAdmin && !isAgentOwner) {
      throw new ForbiddenError(
        "You are not authorized to delete this property",
      );
    }

    return await repo.delete(id, db);
  },
};
