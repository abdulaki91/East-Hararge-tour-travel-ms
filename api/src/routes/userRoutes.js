import express from "express";
import { UserController } from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validation.js";
import Joi from "joi";

const router = express.Router();

const updateProfileValidation = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
});

const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const updateCompanyProfileValidation = Joi.object({
  company_name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  address: Joi.string().max(500).optional(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  website: Joi.string().uri().optional(),
});

const notificationPreferencesValidation = Joi.object({
  email_notifications: Joi.boolean().optional(),
  sms_notifications: Joi.boolean().optional(),
  push_notifications: Joi.boolean().optional(),
  booking_updates: Joi.boolean().optional(),
  payment_updates: Joi.boolean().optional(),
  promotional_offers: Joi.boolean().optional(),
});

const deleteAccountValidation = Joi.object({
  password: Joi.string().required(),
});

// All routes require authentication
router.use(authenticate);

// Profile management
router.get("/profile", UserController.getProfile);
router.put(
  "/profile",
  validate(updateProfileValidation),
  UserController.updateProfile,
);
router.post(
  "/change-password",
  validate(changePasswordValidation),
  UserController.changePassword,
);

// Company profile (only for company users)
router.put(
  "/company-profile",
  authorize("COMPANY"),
  validate(updateCompanyProfileValidation),
  UserController.updateCompanyProfile,
);

// User statistics
router.get("/stats", UserController.getUserStats);

// Notification preferences
router.get(
  "/notification-preferences",
  UserController.getNotificationPreferences,
);
router.put(
  "/notification-preferences",
  validate(notificationPreferencesValidation),
  UserController.updateNotificationPreferences,
);

// Account deletion
router.delete(
  "/account",
  validate(deleteAccountValidation),
  UserController.deleteAccount,
);

export default router;
