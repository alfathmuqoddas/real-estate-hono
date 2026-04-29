import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/errors/http-errors";
import { AgencyRepository } from "./agency.repo";
import type { AgencyInput } from "./schema";
import type { UserContext } from "@/types";

export class AgencyService {
  constructor(private repo: AgencyRepository) {}

  async findAll(user: UserContext["userFirebase"]) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admins can view all agencies");
    }

    return await this.repo.findAll();
  }

  async findById(id: string) {
    if (!id) {
      throw new BadRequestError("Agency id is required");
    }

    return await this.repo.findById(id);
  }

  async create(input: AgencyInput, user: UserContext["userFirebase"]) {
    if (!user.uid) {
      throw new BadRequestError("User id is required");
    }

    if (user.role !== "admin" && user.role !== "agent") {
      throw new ForbiddenError("Only admins or agent can create agencies");
    }
    await this.repo.create(input, user.uid);

    return { message: "Agency created successfully" };
  }

  async update(
    id: string,
    input: Partial<AgencyInput>,
    user: UserContext["userFirebase"],
  ) {
    if (!id) {
      throw new BadRequestError("Agency id is required");
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    const agency = await this.repo.findById(id);

    if (!agency) {
      throw new NotFoundError("Agency not found");
    }

    const isAdmin = user.role === "admin";
    const isCreator = user.uid === agency.createdById;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenError("You are not authorized to update this agency");
    }

    await this.repo.update(id, input);

    return { message: "Agency updated successfully" };
  }

  async delete(id: string, user: UserContext["userFirebase"]) {
    if (!id) {
      throw new BadRequestError("Agency id is required");
    }

    const agency = await this.repo.findById(id);

    if (!agency) {
      throw new NotFoundError("Agency not found");
    }

    const isAdmin = user.role === "admin";
    const isCreator = user.uid === agency.createdById;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenError("You are not authorized to delete this agency");
    }

    await this.repo.delete(id);
    return { message: "Agency deleted successfully" };
  }
}
