import express from "express";
import { BookingController } from "../controllers/bookingController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validation.js";
import {
  createBookingValidation,
  updateBookingValidation,
  bookingQueryValidation,
} from "../validations/bookingValidation.js";
import { checkBookingEnabled } from "../middlewares/systemSettings.js";
import Joi from "joi";

const router = express.Router();

const idValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const statusUpdateValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "completed")
    .required(),
});

// User routes
router.post(
  "/",
  authenticate,
  authorize("USER"),
  checkBookingEnabled,
  validate(createBookingValidation),
  BookingController.createBooking,
);

router.get(
  "/my",
  authenticate,
  authorize("USER"),
  validateQuery(bookingQueryValidation),
  BookingController.getMyBookings,
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("USER"),
  validateParams(idValidation),
  BookingController.cancelBooking,
);

// Company routes
router.get(
  "/company",
  authenticate,
  authorize("COMPANY"),
  validateQuery(bookingQueryValidation),
  BookingController.getCompanyBookings,
);

router.get(
  "/company/stats",
  authenticate,
  authorize("COMPANY"),
  BookingController.getBookingStats,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  validate(statusUpdateValidation),
  BookingController.updateBookingStatus,
);

router.post(
  "/:id/send-confirmation",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  BookingController.sendBookingConfirmation,
);

router.post(
  "/:id/refund",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  BookingController.refundBooking,
);

router.patch(
  "/:id/payment-status",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  validate(
    Joi.object({
      status: Joi.string()
        .valid("pending", "completed", "failed", "refunded")
        .required(),
    }),
  ),
  BookingController.updatePaymentStatus,
);

// Enhanced payment verification routes
router.patch(
  "/:id/verify-payment",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  validate(
    Joi.object({
      status: Joi.string().valid("completed").required(),
      verification_data: Joi.object({
        transaction_id: Joi.string().required(),
        amount: Joi.number().positive().required(),
        payment_date: Joi.string().required(),
        payment_method: Joi.string().required(),
        description: Joi.string().allow("").optional(),
        verified_by: Joi.string().default("company"),
        verified_at: Joi.string().required(),
      }).required(),
    }),
  ),
  BookingController.verifyPayment,
);

router.patch(
  "/:id/reject-payment",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  validate(
    Joi.object({
      status: Joi.string().valid("failed").default("failed"),
      rejection_reason: Joi.string().required(),
      rejected_by: Joi.string().default("company"),
      rejected_at: Joi.string().required(),
    }),
  ),
  BookingController.rejectPayment,
);

// Shared routes (user can view their bookings, company can view their package bookings)
router.get(
  "/:id",
  authenticate,
  authorize("USER", "COMPANY"),
  validateParams(idValidation),
  BookingController.getBookingById,
);

export default router;
