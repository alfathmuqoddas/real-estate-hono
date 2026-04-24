import { CreateUserInput } from "./dto";
import { UserRepository } from "./users.repo";
import { BadRequestError, NotFoundError } from "@/errors/http-errors";

export class UserService {
  constructor(private repo: UserRepository) {}

  async getUserById(id: string) {
    if (!id) {
      throw new BadRequestError("User id is required");
    }
    const result = await this.repo.findById(id);

    if (!result) {
      throw new NotFoundError("User not found");
    }
    return result;
  }

  async syncUserData(payload: CreateUserInput) {
    await this.repo.syncUserData(payload);
  }
}
