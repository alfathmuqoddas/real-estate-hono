import { CreateUserInput } from "./dto";
import { UserRepository as repo } from "./users.repo";
import { BadRequestError, NotFoundError } from "@/errors/http-errors";
import type { DB } from "@/db";

export const UserService = {
  async getUserById(id: string, db: DB) {
    if (!id) {
      throw new BadRequestError("User id is required");
    }
    const result = await repo.findById(id, db);

    if (!result) {
      throw new NotFoundError("User not found");
    }
    return result;
  },

  async syncUserData(payload: CreateUserInput, db: DB) {
    await repo.syncUserData(payload, db);
  },
};
