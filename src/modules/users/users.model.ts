import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { propertiesTable } from "@/modules/properties/properties.model";
import { propertyImagesTable } from "../propertyImages/propertyImages.model";
import { favoritesTable } from "../favorites/favorites.model";
import { agencyTable } from "../agency/agency.model";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(), // Firebase UID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),

  phoneNumber: text("phone_number"),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  age: integer("age"),

  role: text("role", { enum: ["admin", "agent", "user"] }),
  agencyId: text("agency_id").references(() => agencyTable.id),
  agentLicense: text("agent_license"),
  agentLicenseExpiry: integer("agent_license_expiry", { mode: "timestamp" }),

  baseCity: text("base_city"),

  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  lastLogin: integer("last_login", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  properties: many(propertiesTable),
  propertyImages: many(propertyImagesTable),
  favorites: many(favoritesTable),
  agency: one(agencyTable, {
    fields: [usersTable.agencyId],
    references: [agencyTable.id],
  }),
  agenciesCreated: many(agencyTable),
}));
