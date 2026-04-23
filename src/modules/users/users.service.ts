import { db } from "@/db";
import { users } from "@/db/schema";

export const usersService = {
  syncUserData: async (user: {
    uid: string;
    email: string;
    name: string;
    photoUrl: string;
  }) => {
    try {
      return await db
        .insert(users)
        .values({
          id: user.uid,
          email: user.email,
          name: user.name,
          photoUrl: user.photoUrl,
          lastLogin: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            lastLogin: new Date(),
            name: user.name,
            photoUrl: user.photoUrl,
            email: user.email,
          },
        });
    } catch (error) {
      console.error("Database Sync Error:", error);
      throw new Error("Failed to synchronize user data with database.");
    }
  },
};
