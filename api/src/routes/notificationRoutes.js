import express from "express";
import { NotificationController } from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/auth.js";
import { validateParams, validateQuery } from "../middlewares/validation.js";
import Joi from "joi";

const router = express.Router();

const idValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const notificationQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  is_read: Joi.boolean().optional(),
  type: Joi.string().allow("").optional(),
  sort_by: Joi.string().valid("created_at").default("created_at"),
  sort_order: Joi.string().valid("asc", "desc").default("desc"),
});

// All notification routes require authentication
router.use(authenticate);

router.get(
  "/",
  validateQuery(notificationQueryValidation),
  NotificationController.getMyNotifications,
);

router.get("/unread-count", NotificationController.getUnreadCount);

router.patch(
  "/:id/read",
  validateParams(idValidation),
  NotificationController.markAsRead,
);

router.patch("/mark-all-read", NotificationController.markAllAsRead);

router.patch("/bulk-read", NotificationController.bulkMarkAsRead);

router.delete(
  "/:id",
  validateParams(idValidation),
  NotificationController.deleteNotification,
);

export default router;
