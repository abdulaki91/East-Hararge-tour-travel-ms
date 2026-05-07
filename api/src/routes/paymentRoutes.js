import express from "express";
import { PaymentController } from "../controllers/paymentController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validation.js";
import {
  createPaymentValidation,
  processPaymentValidation,
  paymentQueryValidation,
} from "../validations/paymentValidation.js";
import { checkPaymentEnabled } from "../middlewares/systemSettings.js";
import Joi from "joi";

const router = express.Router();

const idValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const bookingIdValidation = Joi.object({
  bookingId: Joi.number().integer().positive().required(),
});

const refundValidation = Joi.object({
  amount: Joi.number().positive().required(),
  reason: Joi.string().required(),
});

// User routes
router.post(
  "/booking/:bookingId",
  authenticate,
  authorize("USER"),
  checkPaymentEnabled,
  validateParams(bookingIdValidation),
  validate(createPaymentValidation),
  PaymentController.createPayment,
);

router.post(
  "/:id/process",
  authenticate,
  authorize("USER"),
  checkPaymentEnabled,
  validateParams(idValidation),
  validate(processPaymentValidation),
  PaymentController.processPayment,
);

// Verify payment status
router.get(
  "/:id/verify",
  authenticate,
  authorize("USER"),
  validateParams(idValidation),
  PaymentController.verifyPayment,
);

// Complete demo payment
router.post(
  "/:id/complete-demo",
  authenticate,
  authorize("USER"),
  validateParams(idValidation),
  PaymentController.completeDemoPayment,
);

// Generate QR code for payment verification
router.get(
  "/:paymentId/qr-code",
  authenticate,
  authorize("USER"),
  PaymentController.generateVerificationQrCode,
);

// Process refund (admin only)
router.post(
  "/:id/refund",
  authenticate,
  authorize("ADMIN"),
  validateParams(idValidation),
  validate(refundValidation),
  PaymentController.processRefund,
);

router.get(
  "/my",
  authenticate,
  authorize("USER"),
  validateQuery(paymentQueryValidation),
  PaymentController.getMyPayments,
);

router.get(
  "/:id",
  authenticate,
  authorize("USER"),
  validateParams(idValidation),
  PaymentController.getPaymentById,
);

router.get(
  "/booking/:bookingId",
  authenticate,
  authorize("USER"),
  validateParams(bookingIdValidation),
  PaymentController.getBookingPayments,
);

// Webhook endpoints (no authentication required)
router.post("/telebirr/webhook", PaymentController.handleTelebirrWebhook);
router.post("/chapa/webhook", PaymentController.handleChapaWebhook);
router.get("/chapa/callback", PaymentController.handleChapaCallback);

export default router;
