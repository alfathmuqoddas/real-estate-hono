import { eq } from "drizzle-orm";
import { agencyTable } from "./agency.model";
import type { AgencyInput } from "./schema";
import type { DB } from "@/db";

export const AgencyRepository = {
  async findAll(db: DB) {
    return await db.query.agencyTable.findMany({
      with: {
        createdBy: {
          columns: {
            id: true,
            email: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    });
  },

  async findById(id: string, db: DB) {
    return await db.query.agencyTable.findFirst({
      with: {
        createdBy: {
          columns: {
            id: true,
            email: true,
            name: true,
            photoUrl: true,
          },
        },
      },
      where: eq(agencyTable.id, Number(id)),
    });
  },

  async create(input: AgencyInput, userId: string, db: DB) {
    return await db
      .insert(agencyTable)
      .values({ ...input, createdById: userId })
      .returning();
  },

  async update(id: string, input: Partial<AgencyInput>, db: DB) {
    return await db
      .update(agencyTable)
      .set(input)
      .where(eq(agencyTable.id, Number(id)))
      .returning();
  },

  async delete(id: string, db: DB) {
    return await db
      .delete(agencyTable)
      .where(eq(agencyTable.id, Number(id)))
      .returning();
  },
};
