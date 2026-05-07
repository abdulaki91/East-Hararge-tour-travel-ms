import api from "./api";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  is_read?: boolean;
  type?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export const notificationService = {
  // Get user notifications
  getNotifications: async (
    filters: NotificationFilters = {},
  ): Promise<NotificationResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data.data;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data.data.unread_count;
  },

  // Mark notification as read
  markAsRead: async (
    notificationIds: number | number[],
  ): Promise<Notification | void> => {
    if (Array.isArray(notificationIds)) {
      // Bulk mark as read
      const response = await api.patch("/notifications/bulk-read", {
        notification_ids: notificationIds,
      });
      return response.data.data;
    } else {
      // Single mark as read
      const response = await api.patch(
        `/notifications/${notificationIds}/read`,
      );
      return response.data.data;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/mark-all-read");
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Get notification types for filtering
  getNotificationTypes: () => [
    { value: "", label: "All Types" },
    { value: "booking_confirmed", label: "Booking Confirmed" },
    { value: "payment_completed", label: "Payment Completed" },
    { value: "payment_failed", label: "Payment Failed" },
    { value: "booking_cancelled", label: "Booking Cancelled" },
    { value: "new_booking", label: "New Booking" },
    { value: "package_status", label: "Package Status" },
    { value: "system_maintenance", label: "System Maintenance" },
    { value: "welcome", label: "Welcome" },
  ],

  // Format notification time
  formatNotificationTime: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  },

  // Get notification icon based on type
  getNotificationIcon: (type: string): string => {
    switch (type) {
      case "booking_confirmed":
        return "✅";
      case "payment_completed":
        return "💳";
      case "payment_failed":
        return "❌";
      case "booking_cancelled":
        return "🚫";
      case "new_booking":
        return "📅";
      case "package_status":
        return "📦";
      case "system_maintenance":
        return "🔧";
      case "welcome":
        return "🎉";
      default:
        return "🔔";
    }
  },

  // Get notification color based on type
  getNotificationColor: (type: string): string => {
    switch (type) {
      case "booking_confirmed":
        return "text-green-600 bg-green-100";
      case "payment_completed":
        return "text-blue-600 bg-blue-100";
      case "payment_failed":
        return "text-red-600 bg-red-100";
      case "booking_cancelled":
        return "text-orange-600 bg-orange-100";
      case "new_booking":
        return "text-purple-600 bg-purple-100";
      case "package_status":
        return "text-indigo-600 bg-indigo-100";
      case "system_maintenance":
        return "text-yellow-600 bg-yellow-100";
      case "welcome":
        return "text-pink-600 bg-pink-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  },
};
