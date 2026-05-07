import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { authService } from "../services/auth";
import toast from "react-hot-toast";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  markNotificationAsRead: (notificationId: number) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const token = authService.getToken();

  const fetchInitialNotifications = useCallback(async () => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5002/api";
      const response = await fetch(`${apiUrl}/notifications?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const notifications = result.data?.notifications || [];
        setNotifications(notifications);

        // Calculate unread count from fetched notifications
        const unread = notifications.filter(
          (n: Notification) => !n.is_read,
        ).length;
        setUnreadCount(unread);
        console.log(
          "📊 Initial notifications loaded:",
          notifications.length,
          "Unread:",
          unread,
        );
      }
    } catch (error) {
      console.error("Failed to fetch initial notifications:", error);
    }
  }, [token]);

  const markNotificationAsRead = useCallback(
    (notificationId: number) => {
      if (socket) {
        socket.emit("notification_read", notificationId);

        // Optimistically update the UI
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    [socket],
  );

  const markAllNotificationsAsRead = useCallback(() => {
    if (socket) {
      socket.emit("mark_all_notifications_read");

      // Optimistically update the UI
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true })),
      );
      setUnreadCount(0);
    }
  }, [socket]);

  const getUnreadCount = useCallback(() => {
    if (socket) {
      socket.emit("get_unread_count");
    }
  }, [socket]);

  useEffect(() => {
    if (user && token) {
      console.log("🔌 Initializing socket connection...");
      console.log("🔌 API URL:", import.meta.env.VITE_API_URL);
      console.log("🔌 User:", user);

      // Remove /api suffix if present for socket connection
      const socketUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5002"
      ).replace(/\/api$/, "");

      console.log("🔌 Socket URL:", socketUrl);

      const newSocket = io(socketUrl, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      });

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("✅ Socket connected successfully");
        setIsConnected(true);

        // Get initial unread count and notifications
        newSocket.emit("get_unread_count");

        // Fetch initial notifications to populate the list
        fetchInitialNotifications();
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        console.error("❌ Error message:", error.message);
        setIsConnected(false);
      });

      // Connection confirmation
      newSocket.on("connection_confirmed", (data) => {
        console.log("🔌 Connection confirmed:", data);
        // Toast removed - no need to show welcome message on every page refresh
      });

      // Notification event handlers
      newSocket.on("new_notification", (notification: Notification) => {
        console.log("🔔 NEW NOTIFICATION RECEIVED:", notification);
        console.log("🔔 Current unreadCount before update:", unreadCount);

        setNotifications((prev) => {
          const updated = [notification, ...prev];
          console.log("🔔 Updated notifications array length:", updated.length);
          return updated;
        });

        setUnreadCount((prev) => {
          const newCount = prev + 1;
          console.log("🔔 Updated unreadCount:", prev, "→", newCount);
          return newCount;
        });

        // Show toast notification
        toast.success(notification.title, {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#10B981",
            color: "white",
          },
        });
      });

      newSocket.on("unread_count_updated", (data) => {
        console.log("📊 UNREAD COUNT UPDATED EVENT:", data.count);
        setUnreadCount(data.count);
      });

      newSocket.on("notification_read_confirmed", (data) => {
        console.log("📖 Notification read confirmed:", data.notificationId);
      });

      newSocket.on("all_notifications_read_confirmed", (data) => {
        console.log("📖 All notifications read confirmed:", data.count);
        toast.success(`${data.count} notifications marked as read`);
      });

      // Booking and payment updates
      newSocket.on("booking_update", (bookingData) => {
        console.log("📅 Booking update received:", bookingData);
        toast.success("Booking status updated!", {
          duration: 4000,
          position: "top-right",
        });
      });

      newSocket.on("payment_update", (paymentData) => {
        console.log("💳 Payment update received:", paymentData);
        toast.success("Payment status updated!", {
          duration: 4000,
          position: "top-right",
        });
      });

      // System announcements
      newSocket.on("system_announcement", (data) => {
        console.log("📢 System announcement:", data);
        toast(data.message, {
          duration: 6000,
          position: "top-center",
          style: {
            background: "#3B82F6",
            color: "white",
          },
        });
      });

      // Error handling
      newSocket.on("notification_error", (error) => {
        console.error("🔔 Notification error:", error);
        toast.error(error.error || "Notification error occurred");
      });

      // Typing indicators (for future chat feature)
      newSocket.on("user_typing", (data) => {
        console.log("⌨️ User typing:", data);
      });

      // User status updates
      newSocket.on("user_status", (data) => {
        console.log("👤 User status update:", data);
      });

      setSocket(newSocket);

      return () => {
        console.log("🔌 Cleaning up socket connection...");
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user, token]);

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
