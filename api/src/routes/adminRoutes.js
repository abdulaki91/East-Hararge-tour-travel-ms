import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validation.js";
import Joi from "joi";

const router = express.Router();

const userIdValidation = Joi.object({
  userId: Joi.number().integer().positive().required(),
});

const companyIdValidation = Joi.object({
  companyId: Joi.number().integer().positive().required(),
});

const reviewIdValidation = Joi.object({
  reviewId: Joi.number().integer().positive().required(),
});

const userStatusValidation = Joi.object({
  is_active: Joi.boolean().required(),
});

const companyVerificationValidation = Joi.object({
  is_verified: Joi.boolean().required(),
});

const reportTypeValidation = Joi.object({
  type: Joi.string()
    .valid("revenue", "bookings", "users", "companies")
    .required(),
});

const notificationIdValidation = Joi.object({
  notificationId: Joi.number().integer().positive().required(),
});

const notificationQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().allow("").optional(),
  type: Joi.string().allow("").optional(),
  is_read: Joi.string().allow("").optional(),
  user_id: Joi.number().integer().positive().optional(),
  sort_by: Joi.string().valid("created_at").default("created_at").optional(),
  sort_order: Joi.string().valid("asc", "desc").default("desc").optional(),
});

const bulkNotificationValidation = Joi.object({
  title: Joi.string().required().max(255),
  message: Joi.string().required().max(1000),
  type: Joi.string().valid("info", "success", "warning", "error").required(),
  user_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
  send_to_all: Joi.boolean().optional(),
});

const settingsValidation = Joi.object({
  // General Settings
  site_name: Joi.string().max(255).optional(),
  site_description: Joi.string().max(1000).optional(),
  contact_email: Joi.string().email().optional(),
  contact_phone: Joi.string().max(20).optional(),

  // System Settings
  maintenance_mode: Joi.boolean().optional(),
  registration_enabled: Joi.boolean().optional(),
  booking_enabled: Joi.boolean().optional(),
  payment_enabled: Joi.boolean().optional(),

  // Notification Settings
  email_notifications: Joi.boolean().optional(),
  sms_notifications: Joi.boolean().optional(),
  push_notifications: Joi.boolean().optional(),

  // Content Settings
  max_upload_size: Joi.number().integer().min(1).max(100).optional(),
  allowed_file_types: Joi.array().items(Joi.string()).optional(),
  max_images_per_package: Joi.number().integer().min(1).max(50).optional(),

  // Booking Settings
  min_booking_advance_days: Joi.number().integer().min(0).max(365).optional(),
  max_booking_advance_days: Joi.number().integer().min(1).max(730).optional(),
  cancellation_deadline_hours: Joi.number()
    .integer()
    .min(0)
    .max(720)
    .optional(),
  auto_confirm_bookings: Joi.boolean().optional(),

  // Payment Settings
  currency: Joi.string().max(10).optional(),
  payment_gateway: Joi.string().max(50).optional(),
  commission_rate: Joi.number().min(0).max(100).optional(),
  refund_processing_days: Joi.number().integer().min(1).max(90).optional(),

  // Security Settings
  session_timeout_minutes: Joi.number().integer().min(5).max(1440).optional(),
  max_login_attempts: Joi.number().integer().min(1).max(20).optional(),
  password_min_length: Joi.number().integer().min(6).max(32).optional(),
  require_email_verification: Joi.boolean().optional(),
});

const createUserValidation = Joi.object({
  name: Joi.string().required().max(255),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().max(20).optional(),
  role: Joi.string().valid("USER", "COMPANY", "ADMIN").optional(),
});

const updateUserValidation = Joi.object({
  name: Joi.string().max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().max(20).optional(),
  role: Joi.string().valid("USER", "COMPANY", "ADMIN").optional(),
});

const resetPasswordValidation = Joi.object({
  password: Joi.string().min(6).required(),
});

const createCompanyValidation = Joi.object({
  // User data (optional for assign, required for create)
  name: Joi.string().max(255).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  phone: Joi.string().max(20).optional(),
  // Company data (always required)
  company_name: Joi.string().required().max(255),
  business_license: Joi.string().max(255).optional(),
  address: Joi.string().max(500).optional(),
  description: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  is_verified: Joi.boolean().optional(),
});

const updateCompanyValidation = Joi.object({
  // User data
  name: Joi.string().max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().max(20).optional(),
  // Company data
  company_name: Joi.string().max(255).optional(),
  business_license: Joi.string().max(255).optional(),
  address: Joi.string().max(500).optional(),
  description: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
});

// All admin routes require ADMIN role
router.use(authenticate);
router.use(authorize("ADMIN"));

// Dashboard and Stats
router.get("/dashboard", AdminController.getDashboard);
router.get("/stats", AdminController.getStats);
router.get("/health", AdminController.getSystemHealth);

// User management
router.get("/users", AdminController.getAllUsers);
router.post(
  "/users",
  validate(createUserValidation),
  AdminController.createUser,
);
router.put(
  "/users/:userId",
  validateParams(userIdValidation),
  validate(updateUserValidation),
  AdminController.updateUser,
);
router.patch(
  "/users/:userId/status",
  validateParams(userIdValidation),
  validate(userStatusValidation),
  AdminController.updateUserStatus,
);
router.post(
  "/users/:userId/reset-password",
  validateParams(userIdValidation),
  validate(resetPasswordValidation),
  AdminController.resetUserPassword,
);
router.delete(
  "/users/:userId",
  validateParams(userIdValidation),
  AdminController.deleteUser,
);

// Company management
router.get("/companies", AdminController.getAllCompanies);
router.post(
  "/companies",
  validate(createCompanyValidation),
  AdminController.createCompany,
);
router.post(
  "/companies/assign/:userId",
  validateParams(userIdValidation),
  validate(createCompanyValidation),
  AdminController.assignUserToCompany,
);
router.get("/users/without-company", AdminController.getUsersWithoutCompany);
router.get(
  "/companies/for-assignment",
  AdminController.getAllCompaniesForAssignment,
);
router.post(
  "/companies/:companyId/reassign",
  validateParams(companyIdValidation),
  validate(
    Joi.object({ user_id: Joi.number().integer().positive().required() }),
  ),
  AdminController.reassignCompany,
);
router.post(
  "/companies/create-orphan",
  validate(
    Joi.object({
      company_name: Joi.string().required().max(255),
      business_license: Joi.string().max(255).optional(),
      address: Joi.string().max(500).optional(),
      description: Joi.string().max(1000).optional(),
      website: Joi.string().uri().optional(),
      is_verified: Joi.boolean().optional(),
    }),
  ),
  AdminController.createOrphanCompany,
);
router.put(
  "/companies/:companyId",
  validateParams(companyIdValidation),
  validate(updateCompanyValidation),
  AdminController.updateCompany,
);
router.patch(
  "/companies/:companyId/status",
  validateParams(companyIdValidation),
  validate(companyVerificationValidation),
  AdminController.verifyCompany,
);
router.patch(
  "/companies/:companyId/verify",
  validateParams(companyIdValidation),
  validate(companyVerificationValidation),
  AdminController.verifyCompany,
);
router.post(
  "/companies/:companyId/verify-with-reason",
  validateParams(companyIdValidation),
  validate(
    Joi.object({
      is_verified: Joi.boolean().required(),
      rejection_reason: Joi.string().max(500).optional(),
    }),
  ),
  AdminController.verifyCompanyWithReason,
);
router.post(
  "/companies/:companyId/reset-password",
  validateParams(companyIdValidation),
  validate(resetPasswordValidation),
  AdminController.resetCompanyPassword,
);
router.delete(
  "/companies/:companyId",
  validateParams(companyIdValidation),
  AdminController.deleteCompany,
);

// Review management
router.get("/reviews", AdminController.getAllReviews);
router.delete(
  "/reviews/:reviewId",
  validateParams(reviewIdValidation),
  AdminController.deleteReview,
);

// Reports
router.get(
  "/reports/:type",
  validateParams(reportTypeValidation),
  AdminController.generateReport,
);
router.get(
  "/reports/:type/export",
  validateParams(reportTypeValidation),
  AdminController.exportReport,
);

// Notifications management
router.get(
  "/notifications",
  validateQuery(notificationQueryValidation),
  AdminController.getAllNotifications,
);
router.post(
  "/notifications/bulk",
  validate(bulkNotificationValidation),
  AdminController.sendBulkNotification,
);
router.delete(
  "/notifications/:notificationId",
  validateParams(notificationIdValidation),
  AdminController.deleteNotification,
);

// Settings management
router.get("/settings", AdminController.getSettings);
router.put(
  "/settings",
  validate(settingsValidation),
  AdminController.updateSettings,
);

// System logs
router.get("/logs", AdminController.getSystemLogs);

export default router;
