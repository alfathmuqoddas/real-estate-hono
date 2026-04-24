import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { propertiesTable } from "@/modules/properties/properties.model";
import { propertyImagesTable } from "../propertyImages/propertyImages.model";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(), // Firebase UID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),

  // Professional Branding
  phoneNumber: text("phone_number"), // WhatsApp is the primary communication channel
  photoUrl: text("photo_url"), // Sync this from Google/Firebase profile
  bio: text("bio"), // "Experienced agent in South Jakarta for 10 years"
  age: integer("age"),

  // Credentials & Trust
  role: text("role", { enum: ["admin", "agent", "user"] }).default("user"),
  agencyName: text("agency_name"), // e.g., "Ray White", "ERA Indonesia"
  agentLicense: text("agent_license"), // SIPP (Sertifikat Izin Penyelamat Properti) if applicable

  // Location (helpful for suggesting local listings)
  baseCity: text("base_city"),

  // Status & Timestamps
  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  lastLogin: integer("last_login", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export const usersRelations = relations(usersTable, ({ many }) => ({
  properties: many(propertiesTable),
  propertyImages: many(propertyImagesTable),
}));
