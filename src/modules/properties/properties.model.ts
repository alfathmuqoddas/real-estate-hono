import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { usersTable } from "@/modules/users/users.model";
import { v7 as uuidv7 } from "uuid";

const users = usersTable;

export const propertiesTable = sqliteTable("properties", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  propertyType: text("property_type", { enum: ["Rumah", "Apartemen"] }),
  propertyTitle: text("property_title").notNull(),
  propertyDeskripsi: text("property_deskripsi").notNull(),
  propertyPrice: integer("property_price").notNull(),
  propertyListingType: text("listing_type", {
    enum: ["sale", "rent"],
  }).notNull(),
  propertyLuasTanah: integer("property_luas_tanah").notNull(),
  propertyLuasBangunan: integer("property_luas_bangunan").notNull(),
  propertyKamarMandi: integer("property_kamar_mandi").notNull(),
  propertyKamarTidur: integer("property_kamar_tidur").notNull(),
  propertyCarport: integer("property_carport"),
  propertyTipeSertifikat: text("property_tipe_sertifikat", {
    enum: ["SHM", "HGB", "SHP", "HGU", "SHMSRS"],
  }),
  propertyJumlahLantai: integer("property_jumlah_lantai"),
  propertyGarasi: integer("property_garasi"),
  propertyDayaListrik: integer("property_daya_listrik"),
  propertyTipeIklan: text("property_tipe_iklan", {
    enum: ["Dijual", "Disewa"],
  }),
  propertyPerabotan: text("property_tipe_perabotan", {
    enum: ["Fully Furnished", "Unfurnished", "Semi-furnished"],
  }),

  // Address
  propertyAddressProvince: text("property_address_province").notNull(),
  propertyAddressCity: text("property_address_city").notNull(),
  propertyAddressLat: real("property_address_lat"),
  propertyAddressLon: real("property_address_lon"),

  // Agent
  propertyAgentId: text("property_agent_id")
    .notNull()
    .references(() => users.id),

  status: text("status", { enum: ["active", "inactive"] }).default("inactive"),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export type InsertPost = typeof propertiesTable.$inferInsert;
export type SelectPost = typeof propertiesTable.$inferSelect;
