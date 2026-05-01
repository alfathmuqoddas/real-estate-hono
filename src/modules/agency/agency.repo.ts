import { eq } from "drizzle-orm";
import { agencyTable } from "./agency.model";
import type { AgencyInput } from "./schema";

export class AgencyRepository {
  constructor(private db: ReturnType<typeof import("@/db").getDb>) {}

  async findAll() {
    return await this.db.query.agencyTable.findMany({
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
  }

  async findById(id: string) {
    return await this.db.query.agencyTable.findFirst({
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
  }

  async create(input: AgencyInput, userId: string) {
    return await this.db
      .insert(agencyTable)
      .values({ ...input, createdById: userId })
      .returning();
  }

  async update(id: string, input: Partial<AgencyInput>) {
    return await this.db
      .update(agencyTable)
      .set(input)
      .where(eq(agencyTable.id, Number(id)))
      .returning();
  }

  async delete(id: string) {
    return await this.db
      .delete(agencyTable)
      .where(eq(agencyTable.id, Number(id)))
      .returning();
  }
}
