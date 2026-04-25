import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { propertiesTable } from "@/modules/properties/properties.model";
import { usersTable } from "@/modules/users/users.model";
import { v7 as uuidv7 } from "uuid";
import { relations } from "drizzle-orm";

export const propertyImagesTable = sqliteTable("property_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  propertyId: text("property_id")
    .notNull()
    .references(() => propertiesTable.id),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  imageUrl: text("image_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export type InsertPropertyImage = typeof propertyImagesTable.$inferInsert;
export type SelectPropertyImage = typeof propertyImagesTable.$inferSelect;

export const propertyImagesRelations = relations(
  propertyImagesTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [propertyImagesTable.propertyId],
      references: [propertiesTable.id],
    }),
    uploader: one(usersTable, {
      fields: [propertyImagesTable.userId],
      references: [usersTable.id],
    }),
  }),
);
