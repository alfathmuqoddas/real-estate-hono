import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "@/modules/users/users.model";
import { propertiesTable } from "@/modules/properties/properties.model";
import { v7 as uuidv7 } from "uuid";
import { relations } from "drizzle-orm";

export const favoritesTable = sqliteTable("favorites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  propertyId: text("property_id")
    .notNull()
    .references(() => propertiesTable.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export type InsertFavorite = typeof favoritesTable.$inferInsert;
export type SelectFavorite = typeof favoritesTable.$inferSelect;

export const favoritesRelations = relations(favoritesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [favoritesTable.userId],
    references: [usersTable.id],
  }),
  property: one(propertiesTable, {
    fields: [favoritesTable.propertyId],
    references: [propertiesTable.id],
  }),
}));
