import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "@/modules/users/users.model";
import { relations } from "drizzle-orm";

export const agencyTable = sqliteTable("agency", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agencyName: text("agency_name").notNull(),
  logoUrl: text("logo_url").notNull(),
  websiteUrl: text("website_url"),
  phoneNumber: text("phone_number"),
  email: text("email").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  establishedAt: integer("established_at", { mode: "timestamp" }),
  createdById: text("created_by_id")
    .notNull()
    .references((): any => usersTable.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export type InsertAgency = typeof agencyTable.$inferInsert;
export type SelectAgency = typeof agencyTable.$inferSelect;

export const agencyRelations = relations(agencyTable, ({ one, many }) => ({
  members: many(usersTable),
  createdBy: one(usersTable, {
    fields: [agencyTable.createdById],
    references: [usersTable.id],
  }),
}));
