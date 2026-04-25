import { z } from "zod";

export type CreatePropertyInput = {
  propertyTitle: string;
  propertyDeskripsi: string;
  propertyPrice: number;
  propertyListingType: "sell" | "rent";
  propertyType: "rumah" | "apartemen";
  propertyLuasTanah: number;
  propertyLuasBangunan: number;
  propertyKamarMandi: number;
  propertyKamarTidur: number;
  propertyCarport?: number;
  propertyTipeSertifikat?: "SHM" | "HGB" | "SHP" | "HGU" | "SHMSRS";
  propertyJumlahLantai?: number;
  propertyGarasi?: number;
  propertyDayaListrik?: 450 | 900 | 1300 | 2200 | 3500 | 5500 | 6600;
  propertyPerabotan?: "Fully Furnished" | "Unfurnished" | "Semi-furnished";

  // Address
  propertyAddressProvince: string;
  propertyAddressCity: string;
  propertyAddressLat?: number;
  propertyAddressLon?: number;
};

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

export const createPropertyInputSchema = z.array(
  z
    .object({
      propertyTitle: z.string().min(1, "Property title is required"),
      propertyDeskripsi: z.string().min(1, "Property description is required"),
      propertyPrice: z.coerce.number().min(1, "Property price is required"),
      propertyListingType: z.enum(["sell", "rent"]).default("sell"),
      propertyType: z.enum(["rumah", "apartemen"]).default("rumah"),
      //if the type is apartement propertyLuasTanah can be 0
      propertyLuasTanah: z.coerce.number(),
      propertyLuasBangunan: z.coerce
        .number()
        .min(1, "Property floor size is required"),
      propertyKamarMandi: z.coerce
        .number()
        .min(1, "Property bathrooms is required"),
      propertyKamarTidur: z.coerce
        .number()
        .min(1, "Property bedrooms is required"),
      propertyCarport: z.coerce.number().optional(),
      propertyPerabotan: z
        .enum(["Fully Furnished", "Unfurnished", "Semi-furnished"])
        .optional(),
      propertyAddressProvince: z.string().min(1, "Province is required"),
      propertyAddressCity: z.string().min(1, "City is required"),
      propertyAddressLat: z.coerce.number().optional(),
      propertyAddressLon: z.coerce.number().optional(),
    })
    .superRefine((data, ctx) => {
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
          message: "Must be at least 1",
        });
      }
    }),
);

export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
