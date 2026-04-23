import { CreateUserInput } from "./dto";
import { UserRepository } from "./users.repo";

export class UserService {
  constructor(private repo: UserRepository) {}

  async syncUserData(payload: CreateUserInput) {
    try {
      const result = await this.repo.syncUserData(payload);
      return result;
    } catch (error) {
      console.error("SYNC USER DATA SERVICE ERROR:", error);
      throw new Error("Failed to sync user data");
    }
  }
}
