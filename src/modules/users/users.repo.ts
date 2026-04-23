import { usersTable } from "./users.model";
import type { CreateUserInput } from "./dto";
import { eq } from "drizzle-orm";

export class UserRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findById(id: string) {
    if (!id) {
      throw new Error("User id is required");
    }

    try {
      return await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .get();
    } catch (error) {
      console.error("GET USER BY ID SERVICE ERROR:", error);
      throw new Error("Failed to get user by id");
    }
  }

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
