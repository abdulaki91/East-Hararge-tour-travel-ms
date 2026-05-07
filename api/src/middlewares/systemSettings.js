import { AdminService } from "../services/adminService.js";

// Cache for settings to avoid database queries on every request
let settingsCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Get system settings with caching
 */
export const getSystemSettings = async () => {
  const now = Date.now();

  // Return cached settings if still valid
  if (
    settingsCache &&
    lastCacheUpdate &&
    now - lastCacheUpdate < CACHE_DURATION
  ) {
    return settingsCache;
  }

  // Fetch fresh settings
  try {
    settingsCache = await AdminService.getSettings();
    lastCacheUpdate = now;
    return settingsCache;
  } catch (error) {
    console.error("Error fetching system settings:", error);
    // Return cached settings if available, even if expired
    return settingsCache || {};
  }
};

/**
 * Clear settings cache (call this after updating settings)
 */
export const clearSettingsCache = () => {
  settingsCache = null;
  lastCacheUpdate = null;
};

/**
 * Middleware to check if maintenance mode is enabled
 */
export const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for:
    // 1. Health check endpoint
    // 2. Admin routes
    // 3. Login/auth endpoints (so admins can login)
    if (
      req.path === "/api/health" ||
      req.path.startsWith("/api/admin") ||
      req.path === "/api/auth/login" ||
      req.path === "/api/auth/profile"
    ) {
      return next();
    }

    // If user is authenticated and is an admin, skip maintenance check
    if (req.user && req.user.role_name === "ADMIN") {
      return next();
    }

    const settings = await getSystemSettings();

    if (settings.maintenance_mode === true) {
      return res.status(503).json({
        success: false,
        message:
          "System is currently under maintenance. Please try again later.",
        maintenance_mode: true,
      });
    }

    next();
  } catch (error) {
    // If we can't check settings, allow the request to proceed
    console.error("Error checking maintenance mode:", error);
    next();
  }
};

/**
 * Middleware to check if user registration is enabled
 */
export const checkRegistrationEnabled = async (req, res, next) => {
  try {
    const settings = await getSystemSettings();

    if (settings.registration_enabled === false) {
      return res.status(403).json({
        success: false,
        message: "User registration is currently disabled.",
      });
    }

    next();
  } catch (error) {
    // If we can't check settings, allow the request to proceed
    console.error("Error checking registration setting:", error);
    next();
  }
};

/**
 * Middleware to check if bookings are enabled
 */
export const checkBookingEnabled = async (req, res, next) => {
  try {
    const settings = await getSystemSettings();

    if (settings.booking_enabled === false) {
      return res.status(403).json({
        success: false,
        message: "Booking creation is currently disabled.",
      });
    }

    next();
  } catch (error) {
    // If we can't check settings, allow the request to proceed
    console.error("Error checking booking setting:", error);
    next();
  }
};

/**
 * Middleware to check if payments are enabled
 */
export const checkPaymentEnabled = async (req, res, next) => {
  try {
    const settings = await getSystemSettings();

    if (settings.payment_enabled === false) {
      return res.status(403).json({
        success: false,
        message: "Payment processing is currently disabled.",
      });
    }

    next();
  } catch (error) {
    // If we can't check settings, allow the request to proceed
    console.error("Error checking payment setting:", error);
    next();
  }
};

/**
 * Middleware to attach system settings to request object
 */
export const attachSystemSettings = async (req, res, next) => {
  try {
    req.systemSettings = await getSystemSettings();
    next();
  } catch (error) {
    console.error("Error attaching system settings:", error);
    req.systemSettings = {};
    next();
  }
};
