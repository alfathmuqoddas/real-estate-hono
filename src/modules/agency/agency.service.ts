import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/errors/http-errors";
import { AgencyRepository as repo } from "./agency.repo";
import type { AgencyInput } from "./schema";
import type { UserContext } from "@/types";
import type { DB } from "@/db";

export const AgencyService = {
  async findAll(user: UserContext["userFirebase"], db: DB) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can view all agencies");
    }

    return await repo.findAll(db);
  },

  async findById(id: string, db: DB) {
    if (!id) {
      throw new BadRequestError("Agency id is required");
    }

    return await repo.findById(id, db);
  },

  async create(input: AgencyInput, user: UserContext["userFirebase"], db: DB) {
    if (!user.uid) {
      throw new BadRequestError("User id is required");
    }

    if (user.role !== "admin" && user.role !== "agent") {
      throw new ForbiddenError("Only admins or agent can create agencies");
    }
    await repo.create(input, user.uid, db);

    return { message: "Agency created successfully" };
  },

  async update(
    id: string,
    input: Partial<AgencyInput>,
    user: UserContext["userFirebase"],
    db: DB,
  ) {
    if (!id) {
      throw new BadRequestError("Agency id is required");
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    const agency = await repo.findById(id, db);

    if (!agency) {
      throw new NotFoundError("Agency not found");
    }

    const isAdmin = user.role === "admin";
    const isCreator = user.uid === agency.createdById;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenError("You are not authorized to update this agency");
    }

    await repo.update(id, input, db);

    return { message: "Agency updated successfully" };
  },

  async delete(id: string, user: UserContext["userFirebase"], db: DB) {
    if (!id) {
      throw new BadRequestError("Agency id is required");
    }

    const agency = await repo.findById(id, db);

    if (!agency) {
      throw new NotFoundError("Agency not found");
    }

    const isAdmin = user.role === "admin";
    const isCreator = user.uid === agency.createdById;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenError("You are not authorized to delete this agency");
    }

    await repo.delete(id, db);
    return { message: "Agency deleted successfully" };
  },
};
