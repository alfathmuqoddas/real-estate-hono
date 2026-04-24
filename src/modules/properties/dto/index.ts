import { z } from "zod";

export type CreatePropertyInput = {
  propertyTitle: string;
  propertyDeskripsi: string;
  propertyPrice: number;
  propertyListingType: "sale" | "rent";
  propertyType: "Rumah" | "Apartemen";
  propertyLuasTanah: number;
  propertyLuasBangunan: number;
  propertyKamarMandi: number;
  propertyKamarTidur: number;
  propertyCarport?: number;
  propertyTipeSertifikat?: "SHM" | "HGB" | "SHP" | "HGU" | "SHMSRS";
  propertyJumlahLantai?: number;
  propertyGarasi?: number;
  propertyDayaListrik?: 450 | 900 | 1300 | 2200 | 3500 | 5500 | 6600;
  propertyTipeIklan: "Dijual" | "Disewa";
  propertyPerabotan?: "Fully Furnished" | "Unfurnished" | "Semi-furnished";

  // Address
  propertyAddressProvince: string;
  propertyAddressCity: string;
  propertyAddressLat?: number;
  propertyAddressLon?: number;

  // Agent
  propertyAgentId: string;
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

    province: z.string().min(1, "Province is required"),
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

export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
