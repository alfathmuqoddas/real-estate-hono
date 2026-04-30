import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { propertiesTable } from "../properties/properties.model";

export const propertyFeaturesTable = sqliteTable("property_features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  featureName: text("feature_name").notNull(),
  featureIcon: text("feature_icon").notNull(),
  featurePropertyType: text("feature_property_type"),
  featureSubtype: text("feature_subtype"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const propertyToFeatures = sqliteTable(
  "property_to_features",
  {
    propertyId: text("property_id")
      .notNull()
      .references(() => propertiesTable.id),
    featureId: text("feature_id")
      .notNull()
      .references(() => propertyFeaturesTable.id),
  },
  (t) => [primaryKey({ columns: [t.propertyId, t.featureId] })],
);

export type InsertPropertyFeature = typeof propertyFeaturesTable.$inferInsert;
export type SelectPropertyFeature = typeof propertyFeaturesTable.$inferSelect;

export const featureRelations = relations(
  propertyFeaturesTable,
  ({ many }) => ({
    properties: many(propertyToFeatures),
  }),
);

export const propertyToFeaturesRelations = relations(
  propertyToFeatures,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [propertyToFeatures.propertyId],
      references: [propertiesTable.id],
    }),
    feature: one(propertyFeaturesTable, {
      fields: [propertyToFeatures.featureId],
      references: [propertyFeaturesTable.id],
    }),
  }),
);
