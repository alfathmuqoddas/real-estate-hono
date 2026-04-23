import { CreateUserInput } from "./dto";
import { UserRepository } from "./users.repo";

export class UserService {
  constructor(private repo: UserRepository) {}

  async getUserById(id: string) {
    if (!id) {
      throw new Error("User id is required");
    }
    try {
      const result = await this.repo.findById(id);
      return result;
    } catch (error) {
      console.error("GET USER BY ID SERVICE ERROR:", error);
      throw new Error("Failed to get user by id");
    }
  }

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
