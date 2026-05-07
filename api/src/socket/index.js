import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import pool from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
      ],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyAccessToken(token);

      // Get user details from database
      const [users] = await pool.execute(
        "SELECT id, email, name, role_id FROM users WHERE id = ? AND is_active = true",
        [decoded.userId],
      );

      if (users.length === 0) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.userId = users[0].id;
      socket.userEmail = users[0].email;
      socket.userName = users[0].name;
      socket.userRole = users[0].role_id;

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `🔌 User connected: ${socket.userName} (${socket.userEmail}) - Role: ${socket.userRole}`,
    );

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join role-based rooms
    if (socket.userRole === 1) {
      socket.join("customers");
    } else if (socket.userRole === 2) {
      socket.join("companies");
    } else if (socket.userRole === 3) {
      socket.join("admins");
    }

    // Send user online status
    socket.emit("connection_confirmed", {
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      timestamp: new Date(),
    });

    // Handle notification acknowledgment
    socket.on("notification_read", async (notificationId) => {
      try {
        await pool.execute(
          "UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?",
          [notificationId, socket.userId],
        );

        socket.emit("notification_read_confirmed", { notificationId });
        console.log(
          `📖 Notification ${notificationId} marked as read by user ${socket.userId}`,
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
        socket.emit("notification_error", {
          error: "Failed to mark notification as read",
        });
      }
    });

    // Handle mark all notifications as read
    socket.on("mark_all_notifications_read", async () => {
      try {
        const [result] = await pool.execute(
          "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false",
          [socket.userId],
        );

        socket.emit("all_notifications_read_confirmed", {
          count: result.affectedRows,
        });
        console.log(
          `📖 ${result.affectedRows} notifications marked as read by user ${socket.userId}`,
        );
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        socket.emit("notification_error", {
          error: "Failed to mark all notifications as read",
        });
      }
    });

    // Handle get unread count
    socket.on("get_unread_count", async () => {
      try {
        const [result] = await pool.execute(
          "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
          [socket.userId],
        );

        socket.emit("unread_count_updated", { count: result[0].count });
      } catch (error) {
        console.error("Error getting unread count:", error);
        socket.emit("notification_error", {
          error: "Failed to get unread count",
        });
      }
    });

    // Handle typing indicators (for future chat feature)
    socket.on("typing_start", (data) => {
      socket.to(data.room || `user_${data.targetUserId}`).emit("user_typing", {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: true,
      });
    });

    socket.on("typing_stop", (data) => {
      socket.to(data.room || `user_${data.targetUserId}`).emit("user_typing", {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: false,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(
        `🔌 User disconnected: ${socket.userName} (${socket.userEmail})`,
      );
    });
  });

  console.log(
    "🔌 Socket.IO server initialized with enhanced notification support",
  );
  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

// Enhanced notification functions
export const emitToUser = (userId, eventName, data) => {
  if (!io) return;
  io.to(`user_${userId}`).emit(eventName, data);
  console.log(`📤 Emitted ${eventName} to user ${userId}`);
};

export const emitNotificationToUser = async (userId, notification) => {
  if (!io) return;

  // Emit the notification
  io.to(`user_${userId}`).emit("new_notification", notification);

  // Also emit updated unread count
  try {
    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
      [userId],
    );

    io.to(`user_${userId}`).emit("unread_count_updated", {
      count: result[0].count,
    });
    console.log(
      `🔔 New notification sent to user ${userId}: ${notification.title}`,
    );
  } catch (error) {
    console.error("Error getting unread count after notification:", error);
  }
};

export const emitNotificationToRole = (role, notification) => {
  if (!io) return;

  let room;
  switch (role) {
    case 1:
      room = "customers";
      break;
    case 2:
      room = "companies";
      break;
    case 3:
      room = "admins";
      break;
    default:
      return;
  }

  io.to(room).emit("new_notification", notification);
  console.log(`🔔 Notification sent to ${room}: ${notification.title}`);
};

export const emitBookingUpdate = (userId, bookingData) => {
  if (!io) return;
  io.to(`user_${userId}`).emit("booking_update", bookingData);
  console.log(`📅 Booking update sent to user ${userId}`);
};

export const emitPaymentUpdate = (userId, paymentData) => {
  if (!io) return;
  io.to(`user_${userId}`).emit("payment_update", paymentData);
  console.log(`💳 Payment update sent to user ${userId}`);
};

export const emitSystemAnnouncement = (message) => {
  if (!io) return;
  io.emit("system_announcement", {
    message,
    timestamp: new Date(),
    type: "system",
  });
  console.log(`📢 System announcement sent: ${message}`);
};

export const getConnectedUsers = () => {
  if (!io) return [];

  const connectedUsers = [];
  io.sockets.sockets.forEach((socket) => {
    if (socket.userId) {
      connectedUsers.push({
        userId: socket.userId,
        userName: socket.userName,
        userEmail: socket.userEmail,
        userRole: socket.userRole,
        socketId: socket.id,
      });
    }
  });

  return connectedUsers;
};

export const getConnectionCount = () => {
  if (!io) return 0;
  return io.engine.clientsCount;
};
