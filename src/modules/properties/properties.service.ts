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

  async updateProperty(
    id: string,
    input: Partial<CreatePropertyInput>,
    user: { uid: string; role: string },
  ) {
    try {
      if (!id) {
        throw new Error("Property id is required");
      }

      const property = await this.repo.findById(id);

      if (!property) {
        throw new Error("Property not found");
      }

      if (user.role === "admin") {
        // Admins can update any property
        return await this.repo.update(id, input);
      }

      if (property.propertyAgentId !== user.uid) {
        throw new Error("You are not authorized to update this property");
      }

      if (user.role === "user") {
        throw new Error("User cannot update this property");
      }

      if (Object.keys(input).length === 0) {
        throw new Error("No fields to update");
      }

      const result = await this.repo.update(id, input);
      return result;
    } catch (error) {
      console.error("UPDATE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to update property");
    }
  }

  async deleteProperty(id: string, user: { uid: string; role: string }) {
    try {
      if (!id) {
        throw new Error("Property id is required");
      }

      const property = await this.repo.findById(id);

      if (!property) {
        throw new Error("Property not found");
      }

      if (property.propertyAgentId !== user.uid) {
        throw new Error("You are not authorized to delete this property");
      }

      if (user.role === "user") {
        throw new Error("User cannot delete this property");
      }

      if (user.role === "admin") {
        // Admins can delete any property
        return await this.repo.delete(id);
      }

      const result = await this.repo.delete(id);
      return result;
    } catch (error) {
      console.error("DELETE PROPERTY SERVICE ERROR:", error);
      throw new Error("Failed to delete property");
    }
  }
}
