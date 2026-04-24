import { CreateUserInput } from "./dto";
import { UserRepository } from "./users.repo";
import { BadRequestError } from "@/errors/http-errors";

export class UserService {
  constructor(private repo: UserRepository) {}

  async getUserById(id: string) {
    if (!id) {
      throw new BadRequestError("User id is required");
    }
    await this.repo.findById(id);
  }

  async syncUserData(payload: CreateUserInput) {
    await this.repo.syncUserData(payload);
  }
}
