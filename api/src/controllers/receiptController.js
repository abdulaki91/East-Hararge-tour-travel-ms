import pool from "../config/database.js";
import jwt from "jsonwebtoken";
import qrcode from "qrcode";

export class ReceiptController {
  // Generate QR code for a completed booking/payment
  static async generateReceiptQR(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      // Get booking and payment details
      const [bookings] = await pool.execute(
        `SELECT 
          b.*,
          p.id as payment_id,
          p.amount,
          p.status as payment_status,
          p.transaction_reference,
          p.payment_date,
          pkg.title as package_title,
          pkg.location as package_location,
          c.company_name,
          u.name as customer_name,
          u.email as customer_email
        FROM bookings b
        JOIN payments p ON b.id = p.booking_id
        JOIN packages pkg ON b.package_id = pkg.id
        JOIN companies c ON pkg.company_id = c.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ? AND b.user_id = ? AND p.status = 'completed'`,
        [bookingId, userId],
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or payment not completed",
        });
      }

      const booking = bookings[0];

      // Create JWT payload for QR code
      const qrPayload = {
        type: "receipt_verification",
        booking_id: booking.id,
        payment_id: booking.payment_id,
        booking_reference: booking.booking_reference,
        transaction_reference: booking.transaction_reference,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        package_title: booking.package_title,
        package_location: booking.package_location,
        company_name: booking.company_name,
        amount: booking.amount,
        booking_date: booking.booking_date,
        payment_date: booking.payment_date,
        number_of_people: booking.number_of_people,
        issued_at: new Date().toISOString(),
        // Expire 48 hours after booking date
        expires_at: new Date(
          new Date(booking.booking_date).getTime() + 48 * 60 * 60 * 1000,
        ).toISOString(),
      };

      // Sign the JWT token
      const qrToken = jwt.sign(qrPayload, process.env.JWT_SECRET, {
        expiresIn: "7d", // Max 7 days, but payload has custom expiry
      });

      // Generate QR code with optimal settings for scanning
      const qrCodeDataURL = await qrcode.toDataURL(qrToken, {
        errorCorrectionLevel: "M", // Medium error correction for balance
        type: "image/png",
        quality: 0.92,
        margin: 4, // Increased margin for better detection
        color: {
          dark: "#000000", // Pure black
          light: "#FFFFFF", // Pure white
        },
        width: 400, // Increased size for better scanning
      });

      // Log QR generation
      await pool.execute(
        `INSERT INTO receipt_verifications (booking_id, payment_id, action_type, performed_by, details)
         VALUES (?, ?, 'qr_generated', ?, ?)`,
        [
          booking.id,
          booking.payment_id,
          userId,
          JSON.stringify({ generated_at: new Date().toISOString() }),
        ],
      );

      res.status(200).json({
        success: true,
        data: {
          qr_code: qrCodeDataURL,
          qr_token: qrToken,
          receipt_data: qrPayload,
          expires_at: qrPayload.expires_at,
        },
      });
    } catch (error) {
      console.error("QR generation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate QR code",
      });
    }
  }

  // Verify QR code (for COMPANY and ADMIN users)
  static async verifyReceiptQR(req, res) {
    try {
      const { qrToken } = req.body;
      const verifierId = req.user.id;
      const verifierRole = req.user.role_name;

      if (!qrToken) {
        return res.status(400).json({
          success: false,
          message: "QR token is required",
        });
      }

      // Decode and verify JWT
      let decoded;
      try {
        decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired QR code",
          error: "INVALID_TOKEN",
        });
      }

      // Check if it's a receipt verification token
      if (decoded.type !== "receipt_verification") {
        return res.status(400).json({
          success: false,
          message: "Invalid QR code type",
          error: "INVALID_TYPE",
        });
      }

      // Check custom expiry
      if (new Date() > new Date(decoded.expires_at)) {
        return res.status(400).json({
          success: false,
          message: "QR code has expired",
          error: "EXPIRED",
        });
      }

      // Verify booking and payment still exist and are valid
      const [bookings] = await pool.execute(
        `SELECT 
          b.*,
          p.status as payment_status,
          pkg.company_id,
          c.company_name
        FROM bookings b
        JOIN payments p ON b.id = p.booking_id
        JOIN packages pkg ON b.package_id = pkg.id
        JOIN companies c ON pkg.company_id = c.id
        WHERE b.id = ? AND p.id = ?`,
        [decoded.booking_id, decoded.payment_id],
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking or payment not found",
          error: "NOT_FOUND",
        });
      }

      const booking = bookings[0];

      // Check if payment is still completed
      if (booking.payment_status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Payment is no longer valid",
          error: "PAYMENT_INVALID",
        });
      }

      // Authorization check for COMPANY users
      if (verifierRole === "COMPANY") {
        // Get verifier's company
        const [verifierCompanies] = await pool.execute(
          "SELECT id FROM companies WHERE user_id = ?",
          [verifierId],
        );

        if (verifierCompanies.length === 0) {
          return res.status(403).json({
            success: false,
            message: "Company not found for verifier",
            error: "NO_COMPANY",
          });
        }

        // Check if verifier's company matches booking's company
        if (verifierCompanies[0].id !== booking.company_id) {
          return res.status(403).json({
            success: false,
            message: "You can only verify receipts for your own company",
            error: "UNAUTHORIZED_COMPANY",
          });
        }
      }

      // Check for previous verifications (prevent multiple verifications)
      const [previousVerifications] = await pool.execute(
        `SELECT * FROM receipt_verifications 
         WHERE booking_id = ? AND payment_id = ? AND action_type = 'verified'
         ORDER BY created_at DESC LIMIT 1`,
        [decoded.booking_id, decoded.payment_id],
      );

      const isAlreadyVerified = previousVerifications.length > 0;
      const lastVerification = isAlreadyVerified
        ? previousVerifications[0]
        : null;

      // Log verification attempt
      await pool.execute(
        `INSERT INTO receipt_verifications (booking_id, payment_id, action_type, performed_by, details)
         VALUES (?, ?, 'verified', ?, ?)`,
        [
          decoded.booking_id,
          decoded.payment_id,
          verifierId,
          JSON.stringify({
            verifier_role: verifierRole,
            verification_time: new Date().toISOString(),
            is_duplicate: isAlreadyVerified,
            qr_issued_at: decoded.issued_at,
          }),
        ],
      );

      // Return verification result
      res.status(200).json({
        success: true,
        message: "Receipt verified successfully",
        data: {
          verification_status: "VALID",
          booking_reference: decoded.booking_reference,
          transaction_reference: decoded.transaction_reference,
          customer_name: decoded.customer_name,
          package_title: decoded.package_title,
          package_location: decoded.package_location,
          company_name: decoded.company_name,
          amount: decoded.amount,
          booking_date: decoded.booking_date,
          payment_date: decoded.payment_date,
          number_of_people: decoded.number_of_people,
          verified_by: verifierRole,
          verified_at: new Date().toISOString(),
          is_already_verified: isAlreadyVerified,
          last_verification: lastVerification
            ? {
                verified_at: lastVerification.created_at,
                verified_by_id: lastVerification.performed_by,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("QR verification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify QR code",
      });
    }
  }

  // Get verification history (for ADMIN users)
  static async getVerificationHistory(req, res) {
    try {
      const { bookingId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Only ADMIN can view verification history
      if (req.user.role_name !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Only administrators can view verification history",
        });
      }

      const [verifications] = await pool.execute(
        `SELECT 
          rv.*,
          u.name as performed_by_name,
          u.email as performed_by_email,
          r.name as performed_by_role
        FROM receipt_verifications rv
        JOIN users u ON rv.performed_by = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE rv.booking_id = ?
        ORDER BY rv.created_at DESC
        LIMIT ? OFFSET ?`,
        [bookingId, limit, offset],
      );

      // Get total count
      const [countResult] = await pool.execute(
        "SELECT COUNT(*) as total FROM receipt_verifications WHERE booking_id = ?",
        [bookingId],
      );

      res.status(200).json({
        success: true,
        data: {
          items: verifications,
          pagination: {
            page: parseInt(page),
            totalPages: Math.ceil(countResult[0].total / limit),
            totalItems: countResult[0].total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Verification history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get verification history",
      });
    }
  }
}
