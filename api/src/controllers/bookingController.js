import { BookingService } from "../services/bookingService.js";
import { NotificationService } from "../services/notificationService.js";
import pool from "../config/database.js";

export class BookingController {
  static async createBooking(req, res) {
    try {
      const userId = req.user.id;
      const booking = await BookingService.createBooking(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getMyBookings(req, res) {
    try {
      const userId = req.user.id;
      const result = await BookingService.getUserBookings(userId, req.query);

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

  static async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const booking = await BookingService.getBookingById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Check if user owns this booking or is the company owner
      const userId = req.user.id;
      const userRole = req.user.role_name;

      if (userRole === "USER" && booking.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view this booking",
        });
      }

      if (userRole === "COMPANY") {
        const [companies] = await pool.execute(
          "SELECT id FROM companies WHERE user_id = ?",
          [userId],
        );

        if (companies.length === 0) {
          return res.status(403).json({
            success: false,
            message: "Company not found",
          });
        }

        const [packages] = await pool.execute(
          "SELECT company_id FROM packages WHERE id = ?",
          [booking.package_id],
        );

        if (
          packages.length === 0 ||
          packages[0].company_id !== companies[0].id
        ) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized to view this booking",
          });
        }
      }

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const booking = await BookingService.cancelBooking(id, userId);

      res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getCompanyBookings(req, res) {
    try {
      // Get company ID for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;
      const result = await BookingService.getCompanyBookings(
        companyId,
        req.query,
      );

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

  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Get company ID for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;
      const booking = await BookingService.updateBookingStatus(
        id,
        status,
        null,
        companyId,
      );

      res.status(200).json({
        success: true,
        message: "Booking status updated successfully",
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async sendBookingConfirmation(req, res) {
    try {
      const { id } = req.params;

      // Get company ID for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;
      const result = await BookingService.sendBookingConfirmation(
        id,
        companyId,
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Get company ID for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;

      // Get booking and payment details
      const [bookings] = await pool.execute(
        `SELECT 
          b.*,
          p.title as package_title,
          p.location as package_location,
          u.name as customer_name,
          u.email as customer_email,
          u.phone as customer_phone,
          c.company_name,
          pay.id as payment_id,
          pay.status as current_payment_status,
          pay.payment_method,
          pay.transaction_reference
        FROM bookings b
        JOIN packages p ON b.package_id = p.id
        JOIN companies c ON p.company_id = c.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN payments pay ON b.id = pay.booking_id
        WHERE b.id = ? AND p.company_id = ?`,
        [id, companyId],
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or unauthorized",
        });
      }

      const booking = bookings[0];

      // Update or create payment record
      let paymentId = booking.payment_id;

      if (!paymentId) {
        // Create new payment record
        const [paymentResult] = await pool.execute(
          `INSERT INTO payments (booking_id, amount, status, payment_method, created_at, updated_at) 
           VALUES (?, ?, ?, 'manual_approval', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [booking.id, booking.total_amount, status],
        );
        paymentId = paymentResult.insertId;
      } else {
        // Update existing payment
        await pool.execute(
          "UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [status, paymentId],
        );
      }

      // When payment is completed, also confirm the booking (if it's still pending)
      if (status === "completed" && booking.status === "pending") {
        await pool.execute(
          "UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [booking.id],
        );
      }

      // Get updated payment info
      const [updatedPayments] = await pool.execute(
        "SELECT * FROM payments WHERE id = ?",
        [paymentId],
      );

      const payment = updatedPayments[0];

      // Send notification to customer
      try {
        if (status === "completed") {
          await NotificationService.createNotification(booking.user_id, {
            title: "Payment Confirmed & Booking Confirmed",
            message: `Your payment for "${booking.package_title}" has been confirmed and your booking is now confirmed. You can download your receipt.`,
            type: "payment_confirmed",
            data: {
              booking_id: booking.id,
              booking_reference: booking.booking_reference,
              amount: booking.total_amount,
              can_download_receipt: true,
            },
          });
        }
      } catch (notificationError) {
        console.error("Error sending payment notification:", notificationError);
      }

      res.status(200).json({
        success: true,
        message: `Payment status updated to ${status}${status === "completed" && booking.status === "pending" ? " and booking confirmed" : ""}`,
        data: {
          booking_id: booking.id,
          payment_id: paymentId,
          payment_status: status,
          booking_status:
            status === "completed" && booking.status === "pending"
              ? "confirmed"
              : booking.status,
          receipt_data:
            status === "completed"
              ? {
                  booking_reference: booking.booking_reference,
                  customer_name: booking.customer_name,
                  customer_email: booking.customer_email,
                  customer_phone: booking.customer_phone,
                  package_title: booking.package_title,
                  package_location: booking.package_location,
                  booking_date: booking.booking_date,
                  number_of_people: booking.number_of_people,
                  total_amount: booking.total_amount,
                  payment_method: payment.payment_method || "manual_approval",
                  payment_date: payment.updated_at,
                  company_name: booking.company_name,
                  transaction_reference: payment.transaction_reference,
                }
              : null,
        },
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
      const { status, verification_data } = req.body;

      // Get company ID for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;

      // Get booking details
      const [bookings] = await pool.execute(
        `SELECT 
          b.*,
          p.title as package_title,
          p.location as package_location,
          u.name as customer_name,
          u.email as customer_email,
          u.phone as customer_phone,
          c.company_name,
          pay.id as payment_id
        FROM bookings b
        JOIN packages p ON b.package_id = p.id
        JOIN companies c ON p.company_id = c.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN payments pay ON b.id = pay.booking_id
        WHERE b.id = ? AND p.company_id = ?`,
        [id, companyId],
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or unauthorized",
        });
      }

      const booking = bookings[0];
      let paymentId = booking.payment_id;

      // Create or update payment record with verification data
      if (!paymentId) {
        const [paymentResult] = await pool.execute(
          `INSERT INTO payments (
            booking_id, amount, status, payment_method, 
            transaction_reference, gateway_verification_data,
            payment_date, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            booking.id,
            verification_data.amount || booking.total_amount,
            status,
            verification_data.payment_method || "manual_verification",
            verification_data.transaction_id,
            JSON.stringify({
              ...verification_data,
              verified_by_company: true,
              company_id: companyId,
            }),
            verification_data.payment_date,
          ],
        );
        paymentId = paymentResult.insertId;
      } else {
        await pool.execute(
          `UPDATE payments SET 
            status = ?, 
            transaction_reference = ?,
            gateway_verification_data = ?,
            payment_date = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [
            status,
            verification_data.transaction_id,
            JSON.stringify({
              ...verification_data,
              verified_by_company: true,
              company_id: companyId,
            }),
            verification_data.payment_date,
            paymentId,
          ],
        );
      }

      // Update booking status if payment is completed
      if (status === "completed" && booking.status === "pending") {
        await pool.execute(
          "UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [booking.id],
        );
      }

      // Send notification to customer
      try {
        if (status === "completed") {
          await NotificationService.createNotification(booking.user_id, {
            title: "Payment Verified & Booking Confirmed",
            message: `Your payment for "${booking.package_title}" has been verified by the company. Your booking is now confirmed!`,
            type: "payment_verified",
          });
        }
      } catch (notificationError) {
        console.error(
          "Error sending verification notification:",
          notificationError,
        );
      }

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          booking_id: booking.id,
          payment_id: paymentId,
          payment_status: status,
          booking_status:
            status === "completed" && booking.status === "pending"
              ? "confirmed"
              : booking.status,
          verification_data: verification_data,
        },
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async rejectPayment(req, res) {
    try {
      const { id } = req.params;
      const { status, rejection_reason, rejected_by, rejected_at } = req.body;

      // Get company ID for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;

      // Get booking details
      const [bookings] = await pool.execute(
        `SELECT 
          b.*,
          p.title as package_title,
          u.name as customer_name,
          u.email as customer_email,
          pay.id as payment_id
        FROM bookings b
        JOIN packages p ON b.package_id = p.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN payments pay ON b.id = pay.booking_id
        WHERE b.id = ? AND p.company_id = ?`,
        [id, companyId],
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or unauthorized",
        });
      }

      const booking = bookings[0];
      let paymentId = booking.payment_id;

      // Create or update payment record with rejection data
      const rejectionData = {
        rejection_reason,
        rejected_by: "company",
        rejected_at: new Date().toISOString(),
        company_id: companyId,
      };

      if (!paymentId) {
        const [paymentResult] = await pool.execute(
          `INSERT INTO payments (
            booking_id, amount, status, payment_method,
            gateway_verification_data, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            booking.id,
            booking.total_amount,
            status || "failed",
            "manual_verification",
            JSON.stringify(rejectionData),
          ],
        );
        paymentId = paymentResult.insertId;
      } else {
        await pool.execute(
          `UPDATE payments SET 
            status = ?, 
            gateway_verification_data = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [status || "failed", JSON.stringify(rejectionData), paymentId],
        );
      }

      // Send notification to customer
      try {
        await NotificationService.createNotification(booking.user_id, {
          title: "Payment Verification Failed",
          message: `Your payment for "${booking.package_title}" could not be verified. Reason: ${rejection_reason}. Please contact us or try making the payment again.`,
          type: "payment_rejected",
        });
      } catch (notificationError) {
        console.error(
          "Error sending rejection notification:",
          notificationError,
        );
      }

      res.status(200).json({
        success: true,
        message: "Payment verification rejected",
        data: {
          booking_id: booking.id,
          payment_id: paymentId,
          payment_status: status || "failed",
          rejection_reason,
        },
      });
    } catch (error) {
      console.error("Payment rejection error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async refundBooking(req, res) {
    try {
      const { id } = req.params;

      // Get company ID for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;
      const result = await BookingService.refundBooking(id, companyId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getBookingStats(req, res) {
    try {
      // Get company ID for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;
      const stats = await BookingService.getBookingStats(companyId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
