import api from "./api";
import type { ApiResponse } from "../types";

export interface Company {
  id: number;
  user_id: number;
  company_name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  license_number?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const companyService = {
  async getCompanyProfile(): Promise<ApiResponse<Company>> {
    const response = await api.get("/company/me");
    return response.data;
  },

  async registerCompany(data: {
    company_name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    license_number?: string;
  }): Promise<ApiResponse<Company>> {
    const response = await api.post("/company/register", data);
    return response.data;
  },

  async updateCompany(data: Partial<Company>): Promise<ApiResponse<Company>> {
    const response = await api.put("/company/me", data);
    return response.data;
  },
};
