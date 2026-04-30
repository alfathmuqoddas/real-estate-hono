import { z } from "zod";

export const propertyQuerySchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),

    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),

    bathrooms: z.coerce.number().optional(),
    bedrooms: z.coerce.number().optional(),

    minLotSize: z.coerce.number().optional(),
    maxLotSize: z.coerce.number().optional(),

    minFloorSize: z.coerce.number().optional(),
    maxFloorSize: z.coerce.number().optional(),

    type: z.enum(["rumah", "apartemen"]).optional(),
    listingType: z.enum(["sell", "rent"]).optional(),

    province: z.string().optional(),
    city: z.string().optional(),

    sortBy: z.enum(["price", "lotSize", "floorSize", "createdAt"]).optional(),

    order: z.enum(["asc", "desc"]).optional(),
  })
  .refine(
    (data) => {
      if (data.city && !data.province) return false;
      return true;
    },
    {
      message: "City requires province",
      path: ["city"],
    },
  )
  .refine(
    (data) =>
      !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
    {
      message: "minPrice must be <= maxPrice",
      path: ["minPrice"],
    },
  );

const propertyInputFields = z.object({
  propertyTitle: z.string().min(1, "Property title is required"),
  propertyDeskripsi: z.string().min(1, "Property description is required"),
  propertyPrice: z.coerce.number().min(1, "Property price is required"),
  propertyListingType: z.enum(["sell", "rent"]).default("sell"),
  propertyType: z.enum(["rumah", "apartemen"]).default("rumah"),

  // Base numbers
  propertyLuasTanah: z.coerce.number(),
  propertyLuasBangunan: z.coerce.number().min(1, "Floor size is required"),
  propertyKamarMandi: z.coerce.number().min(1),
  propertyKamarTidur: z.coerce.number().min(1),

  // Missing Optional Fields from your Manual Type
  propertyCarport: z.coerce.number().optional(),
  propertyGarasi: z.coerce.number().optional(),
  propertyJumlahLantai: z.coerce.number().optional(),
  propertyDayaListrik: z
    .union([
      z.literal(450),
      z.literal(900),
      z.literal(1300),
      z.literal(2200),
      z.literal(3500),
      z.literal(5500),
      z.literal(6600),
    ])
    .optional(),
  propertyTipeSertifikat: z
    .enum(["SHM", "HGB", "SHP", "HGU", "SHMSRS"])
    .optional(),
  propertyPerabotan: z
    .enum(["Fully Furnished", "Unfurnished", "Semi-furnished"])
    .optional(),

  // Address
  propertyAddressProvince: z.string().min(1, "Province is required"),
  propertyAddressCity: z.string().min(1, "City is required"),
  propertyAddressLat: z.coerce.number().optional(),
  propertyAddressLon: z.coerce.number().optional(),

  // Relationship field
  propertyFeatures: z
    .array(z.string())
    .optional()
    .default([])
    .transform((val) => [...new Set(val)]),
});

export const createPropertyInputSchema = propertyInputFields.superRefine(
  (data, ctx) => {
    const isApartment = data.propertyType === "apartemen";
    if (isApartment && data.propertyLuasTanah < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["propertyLuasTanah"],
        message: "Cannot be negative",
      });
    }
    if (!isApartment && data.propertyLuasTanah < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["propertyLuasTanah"],
        message: "Must be at least 1 for houses",
      });
    }
  },
);

export const updatePropertyInputSchema = propertyInputFields
  .partial()
  .superRefine((data, ctx) => {
    if (
      data.propertyType !== undefined &&
      data.propertyLuasTanah !== undefined
    ) {
      const isApartment = data.propertyType === "apartemen";

      if (isApartment && data.propertyLuasTanah < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["propertyLuasTanah"],
          message: "Cannot be negative",
        });
      }

      if (!isApartment && data.propertyLuasTanah < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["propertyLuasTanah"],
          message: "Must be at least 1 for houses",
        });
      }
    }
  });

export type CreatePropertyInput = z.infer<typeof createPropertyInputSchema>;

export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
