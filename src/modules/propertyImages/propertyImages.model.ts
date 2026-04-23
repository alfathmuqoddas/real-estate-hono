import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { propertiesTable } from "@/modules/properties/properties.model";
import { usersTable } from "@/modules/users/users.model";
import { v7 as uuidv7 } from "uuid";

const users = usersTable;
const properties = propertiesTable;

export const propertyImagesTable = sqliteTable("property_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  propertyId: integer("property_id")
    .notNull()
    .references(() => properties.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  imageUrl: text("image_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
