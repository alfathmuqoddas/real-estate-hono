import { PropertyImageRepository as repo } from "./propertyImages.repo";
import type { CreatePropertyImageInput } from "./dto";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/errors/http-errors";
import type { DB } from "@/db";
import type { UserContext } from "@/types";

export const PropertyImageService = {
  async createPropertyImage(
    input: CreatePropertyImageInput[],
    user: UserContext["userFirebase"],
    db: DB,
  ) {
    if (!user.uid) {
      throw new BadRequestError("User id is required");
    }
    if (input.length === 0) {
      throw new BadRequestError("No images to create");
    }
    if (!Array.isArray(input)) {
      throw new BadRequestError("Body must be an array");
    }

    if (user.role !== "admin" && user.role !== "agent") {
      throw new ForbiddenError(
        "Only admins or agent can create property images",
      );
    }

    const result = await repo.create(input, user.uid, db);

    return { message: `Succesfully created ${result.length} images` };
  },

  async deletePropertyImage(
    id: string,
    user: UserContext["userFirebase"],
    db: DB,
  ) {
    if (!id) {
      throw new BadRequestError("Property image id is required");
    }

    const propertyImage = await repo.findById(id, db);

    if (!propertyImage) {
      throw new NotFoundError("Property image not found");
    }

    const isAdmin = user.role === "admin";
    const isAgentOwner =
      user.role === "agent" && propertyImage.userId === user.uid;

    if (!isAdmin && !isAgentOwner) {
      throw new ForbiddenError(
        "You are not authorized to delete this property image",
      );
    }

    return await repo.delete(id, db);
  },

  async getAllPropertyImages(user: UserContext["userFirebase"], db: DB) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can view all property images");
    }

    return await repo.findAll(db);
  },

  //for admin
  async getPropertyImagesByUserId(
    userId: string,
    user: UserContext["userFirebase"],
    db: DB,
  ) {
    if (!userId) {
      throw new BadRequestError("User id is required");
    }

    if (user.role !== "admin") {
      throw new ForbiddenError(
        "Only admins can view property images by user id",
      );
    }

    return await repo.findByUserId(user.uid, db);
  },

  async getMyPropertyImages(user: UserContext["userFirebase"], db: DB) {
    if (!user.uid) {
      throw new BadRequestError("User id is required");
    }

    return await repo.findByUserId(user.uid, db);
  },

  async getPropertyImages(propertyId: string, db: DB) {
    if (!propertyId) {
      throw new BadRequestError("Property id is required");
    }
    return await repo.findByPropertyId(propertyId, db);
  },
};
