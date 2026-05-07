import { PaymentService } from "../services/paymentService.js";
import { BookingService } from "../services/bookingService.js";
import pool from "../config/database.js";
import qrcode from "qrcode"; // Import qrcode library

export class PaymentController {
  static async createPayment(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      // Verify booking belongs to user
      const booking = await BookingService.getBookingById(bookingId);
      if (!booking || booking.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to create payment for this booking",
        });
      }

      const payment = await PaymentService.createPayment(bookingId, req.body);

      res.status(201).json({
        success: true,
        message: "Payment initiated successfully",
        data: payment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async processPayment(req, res) {
    try {
      const { id } = req.params;
      const { success = true } = req.body; // Mock parameter

      // Get payment details first
      const payment = await PaymentService.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Verify user owns this payment
      if (payment.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to process this payment",
        });
      }

      const processedPayment = await PaymentService.mockPaymentProcess(
        id,
        success,
      );

      res.status(200).json({
        success: true,
        message: `Payment ${processedPayment.status} successfully`,
        data: processedPayment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async verifyPayment(req, res) {
    try {
      const { id } = req.params;

      // Get payment details first
      const payment = await PaymentService.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Verify user owns this payment
      if (payment.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to verify this payment",
        });
      }

      const verifiedPayment = await PaymentService.verifyPayment(id);

      res.status(200).json({
        success: true,
        message: "Payment verification completed",
        data: verifiedPayment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async processRefund(req, res) {
    try {
      const { id } = req.params;
      const refundData = req.body;

      const refund = await PaymentService.processRefund(id, refundData);

      res.status(200).json({
        success: true,
        message: "Refund processed successfully",
        data: refund,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await PaymentService.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Verify user owns this payment
      if (payment.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view this payment",
        });
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getMyPayments(req, res) {
    try {
      const userId = req.user.id;
      const result = await PaymentService.getUserPayments(userId, req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getBookingPayments(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      // Verify booking belongs to user
      const booking = await BookingService.getBookingById(bookingId);
      if (!booking || booking.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view payments for this booking",
        });
      }

      const payments = await PaymentService.getBookingPayments(bookingId);

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Webhook handlers
  static async handleTelebirrWebhook(req, res) {
    try {
      const signature = req.headers["x-telebirr-signature"];
      const payload = req.body;

      await PaymentService.handleWebhook("telebirr", payload, signature);

      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      console.error("Telebirr webhook error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async handleChapaWebhook(req, res) {
    try {
      const signature = req.headers["x-chapa-signature"];
      const payload = req.body;

      await PaymentService.handleWebhook("chapa", payload, signature);

      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      console.error("Chapa webhook error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Chapa callback handler (GET request from Chapa redirect)
  static async handleChapaCallback(req, res) {
    try {
      console.log("🔔 Chapa callback received:", req.query);
      const { tx_ref, status, trx_ref } = req.query;

      if (!tx_ref) {
        console.error("❌ Missing tx_ref in callback");
        return res.redirect(
          `${process.env.FRONTEND_URL}/user/bookings?payment=error&message=Missing transaction reference`,
        );
      }

      console.log("🔍 Looking for payment with tx_ref:", tx_ref);

      // Find payment by transaction reference
      const [payments] = await pool.execute(
        "SELECT id, status FROM payments WHERE transaction_reference = ? OR gateway_transaction_id = ?",
        [tx_ref, tx_ref],
      );

      if (payments.length === 0) {
        console.error("❌ Payment not found for tx_ref:", tx_ref);
        return res.redirect(
          `${process.env.FRONTEND_URL}/user/bookings?payment=error&message=Payment not found`,
        );
      }

      const paymentId = payments[0].id;
      const currentStatus = payments[0].status;
      console.log(
        `✅ Found payment ID: ${paymentId}, current status: ${currentStatus}`,
      );

      // If already completed, just redirect to success
      if (currentStatus === "completed") {
        console.log("✅ Payment already completed, redirecting to success");
        return res.redirect(
          `${process.env.FRONTEND_URL}/user/bookings?payment=success&ref=${tx_ref}`,
        );
      }

      // Verify payment with Chapa
      console.log("🔄 Verifying payment with Chapa...");
      const verifiedPayment = await PaymentService.verifyPayment(paymentId);
      console.log("✅ Payment verification result:", verifiedPayment.status);

      // Redirect based on status
      if (verifiedPayment.status === "completed") {
        console.log("✅ Payment completed successfully, redirecting...");
        return res.redirect(
          `${process.env.FRONTEND_URL}/user/bookings?payment=success&ref=${tx_ref}`,
        );
      } else {
        console.log("❌ Payment failed, redirecting...");
        return res.redirect(
          `${process.env.FRONTEND_URL}/user/bookings?payment=failed&ref=${tx_ref}`,
        );
      }
    } catch (error) {
      console.error("❌ Chapa callback error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/user/bookings?payment=error&message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  // New endpoint for demo payment completion
  static async completeDemoPayment(req, res) {
    try {
      const { id } = req.params;

      // Get payment details first
      const payment = await PaymentService.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Verify user owns this payment
      if (payment.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to complete this payment",
        });
      }

      // Verify it's a demo payment
      if (payment.payment_method !== "demo") {
        return res.status(400).json({
          success: false,
          message: "This endpoint is only for demo payments",
        });
      }

      // Verify payment is still pending
      if (payment.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Payment is already ${payment.status}`,
        });
      }

      // Complete the demo payment
      const completedPayment = await PaymentService.processPayment(
        id,
        "completed",
        {
          demo_completed: true,
          completed_at: new Date().toISOString(),
        },
      );

      res.status(200).json({
        success: true,
        message: "Demo payment completed successfully",
        data: completedPayment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // New endpoint to generate QR code for payment verification
  static async generateVerificationQrCode(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      // Fetch payment details
      const payment = await PaymentService.getPaymentById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Verify user owns this payment
      if (payment.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to access this payment's verification QR code",
        });
      }

      // Verify payment status (ensure it's completed)
      if (payment.status !== "completed") {
        return res.status(400).json({
          success: false,
          message:
            "Payment is not completed and cannot generate a verification QR code.",
        });
      }

      // Call verifyPayment to get the JWT (this will also re-verify if payment is pending, but we've already checked for completed)
      // Note: We are primarily interested in the JWT generated if the payment is completed.
      // If verifyPayment was called and it resulted in a new completion, it will return the JWT.
      // If it was already completed, it will return the existing payment details and generate a new JWT.
      const verifiedPayment = await PaymentService.verifyPayment(paymentId);

      if (!verifiedPayment || !verifiedPayment.jwt) {
        return res.status(500).json({
          success: false,
          message: "Could not generate verification token.",
        });
      }

      // Generate QR code from the JWT
      const qrCodeBuffer = await qrcode.toBuffer(verifiedPayment.jwt, {
        errorCorrectionLevel: "H", // High error correction for robustness
        type: "png",
        margin: 2,
      });

      // Set headers and send QR code image
      res.setHeader("Content-Type", "image/png");
      res.send(qrCodeBuffer);
    } catch (error) {
      console.error("Error generating verification QR code:", error);
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "An unexpected error occurred while generating the QR code.",
      });
    }
  }
}
