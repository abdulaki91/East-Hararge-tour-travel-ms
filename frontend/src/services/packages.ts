import api from "./api";
import type {
  Package,
  PackageFilters,
  PackageFormData,
  ApiResponse,
  PaginatedResponse,
} from "../types";

export const packageService = {
  async getPackages(
    filters: PackageFilters = {},
  ): Promise<PaginatedResponse<Package>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/packages?${params.toString()}`);
    return response.data;
  },

  async getMyPackages(
    filters: PackageFilters = {},
  ): Promise<PaginatedResponse<Package>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `/packages/my/packages?${params.toString()}`,
    );
    return response.data;
  },

  async getPackage(id: number): Promise<ApiResponse<Package>> {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  async createPackage(data: PackageFormData): Promise<ApiResponse<Package>> {
    const formData = new FormData();

    // Append basic fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        (value as File[]).forEach((file) => {
          formData.append("images", file);
        });
      } else if (key === "itinerary") {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.post("/packages", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updatePackage(
    id: number,
    data: Partial<PackageFormData>,
  ): Promise<ApiResponse<Package>> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        (value as File[]).forEach((file) => {
          formData.append("images", file);
        });
      } else if (key === "itinerary") {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put(`/packages/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deletePackage(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  },

  async togglePackageStatus(id: number): Promise<ApiResponse<Package>> {
    const response = await api.patch(`/packages/${id}/toggle-status`);
    return response.data;
  },
};
