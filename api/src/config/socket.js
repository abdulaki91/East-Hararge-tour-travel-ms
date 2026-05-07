import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import pool from "./database.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5174",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user details from database
      const [users] = await pool.execute(
        "SELECT id, email, name, role_id FROM users WHERE id = ? AND is_active = true",
        [decoded.id],
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
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.userName} (${socket.userEmail})`);

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

    // Handle user status
    socket.on("user_online", () => {
      socket.broadcast.emit("user_status", {
        userId: socket.userId,
        status: "online",
        timestamp: new Date(),
      });
    });

    // Handle typing indicators (for future chat feature)
    socket.on("typing_start", (data) => {
      socket.to(data.room).emit("user_typing", {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: true,
      });
    });

    socket.on("typing_stop", (data) => {
      socket.to(data.room).emit("user_typing", {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: false,
      });
    });

    // Handle notification acknowledgment
    socket.on("notification_read", async (notificationId) => {
      try {
        // Update notification as read in database
        await pool.execute(
          "UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?",
          [notificationId, socket.userId],
        );

        // Emit confirmation back to user
        socket.emit("notification_read_confirmed", { notificationId });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(
        `🔌 User disconnected: ${socket.userName} (${socket.userEmail})`,
      );

      socket.broadcast.emit("user_status", {
        userId: socket.userId,
        status: "offline",
        timestamp: new Date(),
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Notification helper functions
export const emitNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit("new_notification", notification);
  }
};

export const emitNotificationToRole = (role, notification) => {
  if (io) {
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
  }
};

export const emitBookingUpdate = (userId, bookingData) => {
  if (io) {
    io.to(`user_${userId}`).emit("booking_update", bookingData);
  }
};

export const emitPaymentUpdate = (userId, paymentData) => {
  if (io) {
    io.to(`user_${userId}`).emit("payment_update", paymentData);
  }
};

export const emitSystemAnnouncement = (message) => {
  if (io) {
    io.emit("system_announcement", {
      message,
      timestamp: new Date(),
      type: "system",
    });
  }
};
