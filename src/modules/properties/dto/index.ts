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
  propertyTipeSertifikat: "SHM" | "HGB" | "SHP" | "HGU" | "SHMSRS";
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
