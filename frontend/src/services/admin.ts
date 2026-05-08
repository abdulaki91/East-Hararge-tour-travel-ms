import api from "./api";
import type { User, Company, ApiResponse, PaginatedResponse } from "../types";

export interface AdminStats {
  total_users: number;
  total_companies: number;
  total_packages: number;
  total_bookings: number;
  total_revenue: number;
  pending_companies: number;
  active_packages: number;
  recent_bookings: number;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  sort_by?: "created_at" | "name" | "email";
  sort_order?: "asc" | "desc";
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  is_verified?: boolean;
  sort_by?: "created_at" | "company_name";
  sort_order?: "asc" | "desc";
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  package_id?: number;
  user_id?: number;
  sort_by?: "created_at" | "rating";
  sort_order?: "asc" | "desc";
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  is_read?: boolean;
  user_id?: number;
  sort_by?: "created_at";
  sort_order?: "asc" | "desc";
}

export interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  max_upload_size: number;
  allowed_file_types: string[];
}

export const adminService = {
  async getStats(): Promise<ApiResponse<AdminStats>> {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  async getGrowthAnalytics(): Promise<ApiResponse<any[]>> {
    const response = await api.get("/admin/growth-analytics");
    return response.data;
  },

  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  async updateUserStatus(
    userId: number,
    is_active: boolean,
  ): Promise<ApiResponse<User>> {
    const response = await api.patch(`/admin/users/${userId}/status`, {
      is_active,
    });
    return response.data;
  },

  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async getCompanies(
    filters: CompanyFilters = {},
  ): Promise<PaginatedResponse<Company>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/companies?${params.toString()}`);
    return response.data;
  },

  async updateCompanyStatus(
    companyId: number,
    status: string,
  ): Promise<ApiResponse<Company>> {
    const response = await api.patch(`/admin/companies/${companyId}/status`, {
      status,
    });
    return response.data;
  },

  async verifyCompany(companyId: number): Promise<ApiResponse<Company>> {
    const response = await api.patch(`/admin/companies/${companyId}/verify`);
    return response.data;
  },

  async deleteCompany(companyId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/admin/companies/${companyId}`);
    return response.data;
  },

  // Reviews management
  async getAllReviews(
    filters: ReviewFilters = {},
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/reviews?${params.toString()}`);
    return response.data;
  },

  async deleteReview(reviewId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  },

  async moderateReview(
    reviewId: number,
    action: "approve" | "reject",
  ): Promise<ApiResponse<any>> {
    const response = await api.patch(`/admin/reviews/${reviewId}/moderate`, {
      action,
    });
    return response.data;
  },

  // Notifications management
  async getAllNotifications(
    filters: NotificationFilters = {},
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/notifications?${params.toString()}`);
    return response.data;
  },

  async sendBulkNotification(data: {
    title: string;
    message: string;
    type: string;
    user_ids?: number[];
    send_to_all?: boolean;
  }): Promise<ApiResponse<void>> {
    const response = await api.post("/admin/notifications/bulk", data);
    return response.data;
  },

  async deleteNotification(notificationId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/admin/notifications/${notificationId}`);
    return response.data;
  },

  // System settings
  async getSettings(): Promise<ApiResponse<SystemSettings>> {
    const response = await api.get("/admin/settings");
    return response.data;
  },

  async updateSettings(
    settings: Partial<SystemSettings>,
  ): Promise<ApiResponse<SystemSettings>> {
    const response = await api.put("/admin/settings", settings);
    return response.data;
  },

  async getSystemLogs(
    filters: {
      page?: number;
      limit?: number;
      level?: string;
      start_date?: string;
      end_date?: string;
    } = {},
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/logs?${params.toString()}`);
    return response.data;
  },

  // User creation
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    const response = await api.post("/admin/users", userData);
    return response.data;
  },

  // User update
  async updateUser(
    userId: number,
    userData: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
    },
  ): Promise<ApiResponse<User>> {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Reset user password
  async resetUserPassword(
    userId: number,
    password: string,
  ): Promise<ApiResponse<void>> {
    const response = await api.post(`/admin/users/${userId}/reset-password`, {
      password,
    });
    return response.data;
  },

  // Company creation
  async createCompany(companyData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    company_name: string;
    business_license?: string;
    address?: string;
    description?: string;
    website?: string;
    is_verified?: boolean;
  }): Promise<ApiResponse<Company>> {
    const response = await api.post("/admin/companies", companyData);
    return response.data;
  },

  // Assign user to company (NEW)
  async assignUserToCompany(
    userId: number,
    companyData: {
      company_name: string;
      business_license?: string;
      address?: string;
      description?: string;
      website?: string;
      is_verified?: boolean;
    },
  ): Promise<ApiResponse<Company>> {
    const response = await api.post(
      `/admin/companies/assign/${userId}`,
      companyData,
    );
    return response.data;
  },

  // Get users without company (NEW)
  async getUsersWithoutCompany(): Promise<ApiResponse<User[]>> {
    const response = await api.get("/admin/users/without-company");
    return response.data;
  },

  // Get all companies for assignment (NEW)
  async getAllCompaniesForAssignment(): Promise<ApiResponse<any[]>> {
    const response = await api.get("/admin/companies/for-assignment");
    return response.data;
  },

  // Reassign company to different user (NEW)
  async reassignCompany(
    companyId: number,
    userId: number,
  ): Promise<ApiResponse<Company>> {
    const response = await api.post(`/admin/companies/${companyId}/reassign`, {
      user_id: userId,
    });
    return response.data;
  },

  // Create orphan company (NEW)
  async createOrphanCompany(companyData: {
    company_name: string;
    business_license?: string;
    address?: string;
    description?: string;
    website?: string;
    is_verified?: boolean;
  }): Promise<ApiResponse<Company>> {
    const response = await api.post(
      "/admin/companies/create-orphan",
      companyData,
    );
    return response.data;
  },

  // Company update
  async updateCompany(
    companyId: number,
    companyData: {
      name?: string;
      email?: string;
      phone?: string;
      company_name?: string;
      business_license?: string;
      address?: string;
      description?: string;
      website?: string;
    },
  ): Promise<ApiResponse<Company>> {
    const response = await api.put(
      `/admin/companies/${companyId}`,
      companyData,
    );
    return response.data;
  },

  // Reset company password
  async resetCompanyPassword(
    companyId: number,
    password: string,
  ): Promise<ApiResponse<void>> {
    const response = await api.post(
      `/admin/companies/${companyId}/reset-password`,
      { password },
    );
    return response.data;
  },
};
