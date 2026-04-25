import { z } from "zod";

export const createPropertyImageInputSchema = z.array(
  z.object({
    propertyId: z.string().min(1, "Property id is required"),
    imageUrl: z.string().min(1, "Image url is required"),
  }),
);

export type CreatePropertyImageInput = {
  propertyId: string;
  imageUrl: string;
};
