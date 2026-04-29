import { usersTable } from "./users.model";
import type { CreateUserInput } from "./dto";
import { eq } from "drizzle-orm";

export class UserRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findById(id: string) {
    return await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .get();
  }

  async syncUserData(input: CreateUserInput) {
    return await this.db
      .insert(usersTable)
      .values({
        id: input.uid,
        email: input.email,
        name: input.name,
        photoUrl: input.photoUrl,
        role: input.role,
        createdAt: new Date(),
        lastLogin: new Date(),
      })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          lastLogin: new Date(),
          name: input.name,
          role: input.role,
          photoUrl: input.photoUrl,
          email: input.email,
        },
      })
      .returning();
  }
}
