import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import "express-async-errors";

// Import database
import { testConnection } from "./config/database.js";
import { setupTables } from "./controllers/setupController.js";

// Import middlewares
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";

// Import socket
import { initSocket } from "./socket/index.js";

// Import system settings middleware
import { checkMaintenanceMode } from "./middlewares/systemSettings.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for development
  }),
);
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173", // Vite dev server
      "http://localhost:5174", // Alternative Vite dev server port
      "http://localhost:3000", // Alternative frontend port
    ],
    credentials: true,
  }),
);

// Body parsing middlewares
app.use(express.json({ limit: "50mb" })); // Increased limit for large images
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Check maintenance mode for all requests
app.use(checkMaintenanceMode);

// Serve static files (uploaded images)
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static("uploads"),
);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "East Hararghe Tour & Travel Management System API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/receipts", receiptRoutes);

// Handle 404 routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (isConnected) {
      // Setup database tables (creates tables if they don't exist)
      await setupTables();
      console.log("✅ Database initialized successfully");
    } else {
      console.warn(
        "⚠️ Database not available. Server will start without database connection.",
      );
      console.warn(
        "⚠️ Database-dependent features will not work until database is available.",
      );
    }

    // Create HTTP server and initialize Socket.io
    const server = http.createServer(app);
    initSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);

      if (!isConnected) {
        console.log(
          "⚠️ Note: Database connection failed. Please check your database configuration.",
        );
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

startServer();

export default app;
