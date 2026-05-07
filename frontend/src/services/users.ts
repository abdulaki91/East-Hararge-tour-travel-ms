import api from "./api";
import type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
  UpdateCompanyProfileData,
  UserStats,
  NotificationPreferences,
  DeleteAccountData,
} from "../types/user";

// Re-export types for convenience
export type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
  UpdateCompanyProfileData,
  UserStats,
  NotificationPreferences,
  DeleteAccountData,
} from "../types/user";

export const userService = {
  // Profile management
  async getProfile(): Promise<UserProfile> {
    const response = await api.get("/users/profile");
    return response.data.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.put("/users/profile", data);
    return response.data.data;
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.post("/users/change-password", data);
  },

  // Company profile (for company users)
  async updateCompanyProfile(
    data: UpdateCompanyProfileData,
  ): Promise<UserProfile> {
    const response = await api.put("/users/company-profile", data);
    return response.data.data;
  },

  // User statistics
  async getUserStats(): Promise<UserStats> {
    const response = await api.get("/users/stats");
    return response.data.data;
  },

  // Notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await api.get("/users/notification-preferences");
    return response.data.data;
  },

  async updateNotificationPreferences(
    data: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const response = await api.put("/users/notification-preferences", data);
    return response.data.data;
  },

  // Account deletion
  async deleteAccount(data: DeleteAccountData): Promise<void> {
    await api.delete("/users/account", { data });
  },
};
