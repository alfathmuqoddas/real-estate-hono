import { PropertyRepository } from "./properties.repo";
import type { CreatePropertyInput } from "./dto";

export class PropertiesService {
  constructor(private repo: PropertyRepository) {}

  async createProperty(input: CreatePropertyInput) {
    try {
      const result = await this.repo.create(input);
      return result;
    } catch (error) {
      console.error("CREATE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to create property");
    }
  }

  async getAllProperties() {
    try {
      const result = await this.repo.findAll();
      return result;
    } catch (error) {
      console.error("GET ALL PROPERTIES SERVICE ERROR:", error);
      throw new Error("Failed to get all properties");
    }
  }

  async getPropertyById(id: string) {
    if (!id) {
      throw new Error("Property id is required");
    }
    try {
      const result = await this.repo.findById(id);
      return result;
    } catch (error) {
      console.error("GET PROPERTY BY ID SERVICE ERROR:", error);
      throw new Error("Failed to get property by id");
    }
  }

  async updateProperty(id: string, input: Partial<CreatePropertyInput>) {
    if (!id) {
      throw new Error("Property id is required");
    }
    if (Object.keys(input).length === 0) {
      throw new Error("No fields to update");
    }
    try {
      const result = await this.repo.update(id, input);
      return result;
    } catch (error) {
      console.error("UPDATE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to update property");
    }
  }

  async deleteProperty(id: string) {
    if (!id) {
      throw new Error("Property id is required");
    }
    try {
      const result = await this.repo.delete(id);
      return result[0] ?? null;
    } catch (error) {
      console.error("DELETE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to delete property");
    }
  }
}
