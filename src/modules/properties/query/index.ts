import type { PropertyQuery } from "@/modules/properties/dto";
import { and, gte, lte, eq, asc, desc } from "drizzle-orm";
import { propertiesTable } from "../properties.model";

export function buildPropertyFilters(query: PropertyQuery) {
  const conditions = [];

  // mandatory
  if (query.province) {
    conditions.push(
      eq(propertiesTable.propertyAddressProvince, query.province),
    );
  }

  if (query.city) {
    conditions.push(eq(propertiesTable.propertyAddressCity, query.city));
  }

  if (query.minPrice !== undefined) {
    conditions.push(gte(propertiesTable.propertyPrice, query.minPrice));
  }

  if (query.maxPrice !== undefined) {
    conditions.push(lte(propertiesTable.propertyPrice, query.maxPrice));
  }

  if (query.bathrooms !== undefined) {
    conditions.push(eq(propertiesTable.propertyKamarMandi, query.bathrooms));
  }

  if (query.bedrooms !== undefined) {
    conditions.push(eq(propertiesTable.propertyKamarTidur, query.bedrooms));
  }

  if (query.minLotSize !== undefined) {
    conditions.push(gte(propertiesTable.propertyLuasTanah, query.minLotSize));
  }

  if (query.maxLotSize !== undefined) {
    conditions.push(lte(propertiesTable.propertyLuasTanah, query.maxLotSize));
  }

  if (query.minFloorSize !== undefined) {
    conditions.push(
      gte(propertiesTable.propertyLuasBangunan, query.minFloorSize),
    );
  }

  if (query.maxFloorSize !== undefined) {
    conditions.push(
      lte(propertiesTable.propertyLuasBangunan, query.maxFloorSize),
    );
  }

  if (query.type) {
    conditions.push(eq(propertiesTable.propertyType, query.type));
  }
  if (query.listingType) {
    conditions.push(eq(propertiesTable.propertyListingType, query.listingType));
  }

  return and(...conditions);
}

export function buildPropertyOrder(query: PropertyQuery) {
  const sortMap = {
    price: propertiesTable.propertyPrice,
    lotSize: propertiesTable.propertyLuasTanah,
    floorSize: propertiesTable.propertyLuasBangunan,
    createdAt: propertiesTable.createdAt,
  };

  const column = sortMap[query.sortBy ?? "createdAt"];
  const orderFn = query.order === "asc" ? asc : desc;

  return [orderFn(column), desc(propertiesTable.id)];
}
