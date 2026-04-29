import { z } from "zod";

export const propertyFeatureItemSchema = z.object({
  featureName: z.string().min(1, "Feature name is required"),
  featureIcon: z.string().min(1, "Feature icon is required"),
  featurePropertyType: z.string().min(1, "Feature property type is required"),
  featureSubtype: z.string().optional(),
});

export const propertyFeaturesSchema = z.array(propertyFeatureItemSchema);
export type PropertyFeatures = z.infer<typeof propertyFeatureItemSchema>;
