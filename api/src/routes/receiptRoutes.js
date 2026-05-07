import express from "express";
import { ReceiptController } from "../controllers/receiptController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate, validateParams } from "../middlewares/validation.js";
import Joi from "joi";

const router = express.Router();

// Validation schemas
const bookingIdValidation = Joi.object({
  bookingId: Joi.number().integer().positive().required(),
});

const qrVerificationValidation = Joi.object({
  qrToken: Joi.string().required(),
});

// Generate QR code for receipt (USER only - for their own bookings)
router.post(
  "/:bookingId/qr",
  authenticate,
  authorize("USER"),
  validateParams(bookingIdValidation),
  ReceiptController.generateReceiptQR,
);

// Verify QR code (COMPANY and ADMIN only)
router.post(
  "/verify",
  authenticate,
  authorize("COMPANY", "ADMIN"),
  validate(qrVerificationValidation),
  ReceiptController.verifyReceiptQR,
);

// Get verification history (ADMIN only)
router.get(
  "/:bookingId/verifications",
  authenticate,
  authorize("ADMIN"),
  validateParams(bookingIdValidation),
  ReceiptController.getVerificationHistory,
);

export default router;
