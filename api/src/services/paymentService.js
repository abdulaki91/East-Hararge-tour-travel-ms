import pool from "../config/database.js";
import {
  generateTransactionReference,
  generateTokens,
  verifyAccessToken,
} from "../utils/jwt.js";
import { NotificationService } from "./notificationService.js";
import { PaymentGatewayService } from "./paymentGatewayService.js";
import { emitPaymentUpdate } from "../socket/index.js";
import qrcode from "qrcode"; // Import qrcode library
import jwt from "jsonwebtoken"; // Import jsonwebtoken

export class PaymentService {
  static async createPayment(bookingId, paymentData) {
    const { amount, payment_method, user_phone, return_url } = paymentData;
    const transaction_reference = generateTransactionReference();

    // Verify booking exists
    const [bookings] = await pool.execute(
      `SELECT b.*, u.email, u.phone, u.name 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.id = ?`,
      [bookingId],
    );

    if (bookings.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookings[0];

    // Verify amount matches booking total
    if (parseFloat(amount) !== parseFloat(booking.total_amount)) {
      throw new Error("Payment amount does not match booking total");
    }

    // Calculate payment fees
    const fees = PaymentGatewayService.getPaymentFees(payment_method, amount);
    const total_amount = parseFloat(amount) + fees;

    // Create payment record
    const [result] = await pool.execute(
      `INSERT INTO payments (booking_id, amount, fees, total_amount, payment_method, transaction_reference, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        bookingId,
        amount,
        fees,
        total_amount,
        payment_method,
        transaction_reference,
      ],
    );

    const paymentId = result.insertId;

    // Initialize payment with gateway
    let gatewayResponse;
    try {
      const gatewayPaymentData = {
        amount: total_amount,
        booking_reference: booking.booking_reference,
        user_email: booking.email,
        user_phone: user_phone || booking.phone,
        user_name: booking.name,
        return_url: return_url || `${process.env.FRONTEND_URL}/user/bookings`,
      };

      switch (payment_method) {
        case "demo":
          gatewayResponse =
            await PaymentGatewayService.initiateDemoPayment(gatewayPaymentData);
          break;
        case "telebirr":
          gatewayResponse =
            await PaymentGatewayService.initiateTelebirrPayment(
              gatewayPaymentData,
            );
          // Add merchant info for display
          if (!gatewayResponse.instructions) {
            gatewayResponse.instructions = {
              account_name: "East Hararghe Tour & Travel",
              account_number: "+251 91 123 4567",
              amount: total_amount,
              reference: booking.booking_reference,
            };
          }
          break;
        case "chapa":
          gatewayResponse =
            await PaymentGatewayService.initiateChapaPayment(
              gatewayPaymentData,
            );
          break;
        case "bank_transfer":
          gatewayResponse =
            PaymentGatewayService.generateBankTransferInstructions(
              gatewayPaymentData,
            );
          break;
        default:
          throw new Error("Unsupported payment method");
      }

      // Update payment with gateway response
      await pool.execute(
        `UPDATE payments 
         SET gateway_transaction_id = ?, gateway_response = ?, payment_url = ?
         WHERE id = ?`,
        [
          gatewayResponse.transaction_id || null,
          JSON.stringify(gatewayResponse),
          gatewayResponse.payment_url || null,
          paymentId,
        ],
      );
    } catch (gatewayError) {
      // Update payment status to failed
      await pool.execute(
        'UPDATE payments SET status = "failed", failure_reason = ? WHERE id = ?',
        [gatewayError.message, paymentId],
      );
      throw gatewayError;
    }

    const payment = await this.getPaymentById(paymentId);
    return {
      ...payment,
      gateway_response: gatewayResponse,
    };
  }

  static async getPaymentById(id) {
    const [payments] = await pool.execute(
      `SELECT 
        p.*,
        b.booking_reference,
        b.user_id,
        pkg.title as package_title,
        u.name,
        u.email
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN packages pkg ON b.package_id = pkg.id
      JOIN users u ON b.user_id = u.id
      WHERE p.id = ?`,
      [id],
    );

    return payments.length > 0 ? payments[0] : null;
  }

  static async processPayment(
    paymentId,
    status = "completed",
    gatewayData = {},
  ) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get current payment details
      const [currentPayments] = await connection.execute(
        "SELECT * FROM payments WHERE id = ?",
        [paymentId],
      );

      if (currentPayments.length === 0) {
        throw new Error("Payment not found");
      }

      const currentPayment = currentPayments[0];

      // Update payment status
      const [paymentResult] = await connection.execute(
        `UPDATE payments 
         SET status = ?, 
             payment_date = CURRENT_TIMESTAMP,
             gateway_verification_data = ?,
             verified_amount = ?
         WHERE id = ?`,
        [
          status,
          JSON.stringify(gatewayData),
          gatewayData.amount || currentPayment.amount,
          paymentId,
        ],
      );

      if (paymentResult.affectedRows === 0) {
        throw new Error("Payment not found");
      }

      // Get payment details
      const [payments] = await connection.execute(
        "SELECT booking_id FROM payments WHERE id = ?",
        [paymentId],
      );

      const bookingId = payments[0].booking_id;

      // Update booking status based on payment status
      if (status === "completed") {
        await connection.execute(
          'UPDATE bookings SET status = "confirmed" WHERE id = ?',
          [bookingId],
        );
      } else if (status === "failed") {
        await connection.execute(
          'UPDATE bookings SET status = "cancelled" WHERE id = ?',
          [bookingId],
        );

        // Restore package slots
        const [bookings] = await connection.execute(
          "SELECT package_id, number_of_people FROM bookings WHERE id = ?",
          [bookingId],
        );

        if (bookings.length > 0) {
          await connection.execute(
            "UPDATE packages SET available_slots = available_slots + ? WHERE id = ?",
            [bookings[0].number_of_people, bookings[0].package_id],
          );
        }
      }

      await connection.commit();

      const updatedPayment = await this.getPaymentById(paymentId);

      // Send notifications based on payment status
      try {
        if (status === "completed") {
          await NotificationService.notifyPaymentCompleted(
            updatedPayment.user_id,
            {
              amount: updatedPayment.amount,
              transaction_reference: updatedPayment.transaction_reference,
            },
          );

          emitPaymentUpdate(updatedPayment.user_id, {
            type: "payment_completed",
            payment: updatedPayment,
          });
        } else if (status === "failed") {
          await NotificationService.notifyPaymentFailed(
            updatedPayment.user_id,
            {
              amount: updatedPayment.amount,
            },
          );

          emitPaymentUpdate(updatedPayment.user_id, {
            type: "payment_failed",
            payment: updatedPayment,
          });
        }
      } catch (notificationError) {
        console.error(
          "Error sending payment notifications:",
          notificationError,
        );
      }

      return updatedPayment;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async verifyPayment(paymentId) {
    console.log("🔍 Starting payment verification for payment ID:", paymentId);
    let payment = await this.getPaymentById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    console.log(
      `📊 Payment status: ${payment.status}, method: ${payment.payment_method}`,
    );
    let is_newly_verified = false; // Flag to indicate if verification was just performed

    if (payment.status === "pending") {
      console.log("⏳ Payment is pending, initiating verification...");
      let verificationResult;
      try {
        switch (payment.payment_method) {
          case "demo":
            verificationResult = await PaymentGatewayService.verifyDemoPayment(
              payment.gateway_transaction_id,
            );
            break;
          case "telebirr":
            verificationResult =
              await PaymentGatewayService.verifyTelebirrPayment(
                payment.gateway_transaction_id,
              );
            break;
          case "chapa":
            console.log(
              "🔄 Verifying Chapa payment with tx_ref:",
              payment.gateway_transaction_id,
            );
            verificationResult = await PaymentGatewayService.verifyChapaPayment(
              payment.gateway_transaction_id,
            );
            console.log("📊 Chapa verification result:", verificationResult);
            break;
          case "bank_transfer":
            // Bank transfers now auto-verify for demo purposes
            verificationResult = {
              success: true,
              status: "completed",
              transaction_id:
                payment.gateway_transaction_id || `BT_${Date.now()}`,
              amount: null,
              verified_at: new Date().toISOString(),
              verification_note:
                "Auto-verified bank transfer for demo purposes",
            };
            break;
          default:
            throw new Error("Unsupported payment method for verification");
        }

        // Process payment based on verification result
        const status = verificationResult.success ? "completed" : "failed";
        console.log(`✅ Processing payment with status: ${status}`);
        payment = await this.processPayment(
          paymentId,
          status,
          verificationResult,
        ); // Update payment object with processed status
        is_newly_verified = true; // Mark that verification just happened
        console.log("✅ Payment processed successfully");
      } catch (error) {
        console.error("❌ Payment verification failed:", error);
        payment = await this.processPayment(paymentId, "failed", {
          error: error.message,
        });
        is_newly_verified = true; // Mark as failed verification
      }
    } else {
      console.log(
        `ℹ️ Payment already ${payment.status}, skipping verification`,
      );
    }

    // Generate JWT if payment is completed (either newly or already)
    let jwtToken = null;
    if (payment.status === "completed") {
      const payload = {
        payment_id: payment.id,
        user_id: payment.user_id,
        booking_id: payment.booking_id,
        booking_reference: payment.booking_reference,
        status: "verified", // Indicate it's a verification token
      };
      jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h", // Short expiry for verification tokens
      });
    }

    // Return payment details along with the JWT and verification status
    return {
      ...payment,
      jwt: jwtToken,
      is_newly_verified: is_newly_verified,
    };
  }

  static async processRefund(paymentId, refundData) {
    const { amount, reason } = refundData;

    const payment = await this.getPaymentById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "completed") {
      throw new Error("Can only refund completed payments");
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Create refund record
      const [refundResult] = await connection.execute(
        `INSERT INTO payment_refunds (payment_id, amount, reason, status, requested_by)
         VALUES (?, ?, ?, 'pending', ?)`,
        [paymentId, amount, reason, "system"], // In production, use actual admin user ID
      );

      const refundId = refundResult.insertId;

      // Process refund through gateway
      const gatewayRefundData = {
        transaction_id: payment.gateway_transaction_id,
        amount: amount,
        reason: reason,
        payment_method: payment.payment_method,
      };

      const refundResponse =
        await PaymentGatewayService.processRefund(gatewayRefundData);

      // Update refund record with gateway response
      await connection.execute(
        `UPDATE payment_refunds 
         SET gateway_refund_id = ?, gateway_response = ?, status = ?
         WHERE id = ?`,
        [
          refundResponse.refund_id,
          JSON.stringify(refundResponse),
          refundResponse.status,
          refundId,
        ],
      );

      // Update payment status if full refund
      if (parseFloat(amount) >= parseFloat(payment.amount)) {
        await connection.execute(
          'UPDATE payments SET status = "refunded" WHERE id = ?',
          [paymentId],
        );

        // Update booking status
        await connection.execute(
          'UPDATE bookings SET status = "cancelled" WHERE id = ?',
          [payment.booking_id],
        );
      }

      await connection.commit();

      // Send notification
      try {
        await NotificationService.notifyRefundProcessed(payment.user_id, {
          amount: amount,
          transaction_reference: payment.transaction_reference,
          estimated_completion: refundResponse.estimated_completion,
        });
      } catch (notificationError) {
        console.error("Error sending refund notification:", notificationError);
      }

      return {
        refund_id: refundId,
        ...refundResponse,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getBookingPayments(bookingId) {
    const [payments] = await pool.execute(
      "SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC",
      [bookingId],
    );

    return payments;
  }

  static async getUserPayments(userId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ["b.user_id = ?"];
    let queryParams = [userId];

    if (status) {
      whereConditions.push("p.status = ?");
      queryParams.push(status);
    }

    const whereClause = whereConditions.join(" AND ");

    const [payments] = await pool.execute(
      `SELECT 
        p.*,
        b.booking_reference,
        pkg.title as package_title,
        pkg.location as package_location
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN packages pkg ON b.package_id = pkg.id
      WHERE ${whereClause}
      ORDER BY p.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM payments p 
       JOIN bookings b ON p.booking_id = b.id 
       WHERE ${whereClause}`,
      queryParams,
    );

    const total = countResult[0].total;

    return {
      items: payments,
      pagination: {
        page: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  static async handleWebhook(provider, payload, signature) {
    try {
      // Verify webhook signature
      const secret =
        provider === "telebirr"
          ? process.env.TELEBIRR_WEBHOOK_SECRET
          : process.env.CHAPA_WEBHOOK_SECRET;

      if (
        !PaymentGatewayService.verifyWebhookSignature(
          payload,
          signature,
          secret,
        )
      ) {
        throw new Error("Invalid webhook signature");
      }

      // Find payment by gateway transaction ID
      const [payments] = await pool.execute(
        "SELECT id FROM payments WHERE gateway_transaction_id = ?",
        [payload.transaction_id || payload.tx_ref],
      );

      if (payments.length === 0) {
        console.warn("Webhook received for unknown payment:", payload);
        return;
      }

      const paymentId = payments[0].id;

      // Process payment based on webhook status
      const status = payload.status === "success" ? "completed" : "failed";
      await this.processPayment(paymentId, status, payload);

      return { success: true };
    } catch (error) {
      console.error("Webhook processing failed:", error);
      throw error;
    }
  }

  static async mockPaymentProcess(paymentId, shouldSucceed = true) {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const status = shouldSucceed ? "completed" : "failed";
    return await this.processPayment(paymentId, status);
  }
}
