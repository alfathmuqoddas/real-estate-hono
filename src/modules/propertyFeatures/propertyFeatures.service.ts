import { UserContext } from "@/types";
import { PropertyFeaturesRepository as repo } from "./propertyFeatures.repo";
import type { PropertyFeatures } from "./schema";
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from "@/errors/http-errors";
import type { DB } from "@/db";

export const PropertyFeaturesService = {
  async findAll(db: DB) {
    return await repo.findAll(db);
  },

  async findById(id: string, db: DB) {
    return await repo.findById(id, db);
  },

  async create(
    input: PropertyFeatures[],
    user: UserContext["userFirebase"],
    db: DB,
  ) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can create property features");
    }

    if (!Array.isArray(input)) {
      throw new Error("Input must be an array");
    }

    await repo.create(input, db);

    return {
      message: `${input.length} record(s) of property features created successfully`,
    };
  },

  async update(
    id: string,
    input: Partial<PropertyFeatures>,
    user: UserContext["userFirebase"],
    db: DB,
  ) {
    if (!id) {
      throw new BadRequestError("Property features id is required");
    }

    const propertyFeatures = await repo.findById(id, db);

    if (!propertyFeatures) {
      throw new NotFoundError("Property features not found");
    }

    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can update property features");
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    await repo.update(id, input, db);

    return { message: "Property features updated successfully" };
  },

  async delete(id: string, user: UserContext["userFirebase"], db: DB) {
    if (!id) {
      throw new BadRequestError("Property features id is required");
    }

    const propertyFeatures = await repo.findById(id, db);

    if (!propertyFeatures) {
      throw new NotFoundError("Property features not found");
    }

    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can delete property features");
    }

    return await repo.delete(id, db);
  },
};
