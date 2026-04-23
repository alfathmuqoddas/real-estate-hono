import { usersTable } from "./users.model";
import type { CreateUserInput } from "./dto";

export class UserRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async syncUserData(input: CreateUserInput) {
    try {
      return await this.db
        .insert(usersTable)
        .values({
          id: input.uid,
          email: input.email,
          name: input.name,
          photoUrl: input.photoUrl,
          createdAt: new Date(),
          lastLogin: new Date(),
        })
        .onConflictDoUpdate({
          target: usersTable.id,
          set: {
            lastLogin: new Date(),
            name: input.name,
            photoUrl: input.photoUrl,
            email: input.email,
          },
        })
        .run();
    } catch (error) {
      console.error("ADD USER SERVICE ERROR:", error);
      throw new Error("Failed to add user");
    }
  }
}
