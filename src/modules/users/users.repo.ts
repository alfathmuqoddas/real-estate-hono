import { usersTable } from "./users.model";
import type { CreateUserInput } from "./dto";
import { eq } from "drizzle-orm";
import type { DB } from "@/db";

export const UserRepository = {
  async findById(id: string, db: DB) {
    return await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .get();
  },

  async syncUserData(input: CreateUserInput, db: DB) {
    return await db
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
  },
};
