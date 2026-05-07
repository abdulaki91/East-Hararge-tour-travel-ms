import pool from "../config/database.js";
import { generateBookingReference } from "../utils/jwt.js";
import { NotificationService } from "./notificationService.js";
import { emitBookingUpdate } from "../socket/index.js";

export class BookingService {
  static async createBooking(userId, bookingData) {
    const { package_id, number_of_people, booking_date, special_requests } =
      bookingData;

    // Get package details
    const [packages] = await pool.execute(
      "SELECT * FROM packages WHERE id = ? AND is_active = true",
      [package_id],
    );

    if (packages.length === 0) {
      throw new Error("Package not found or inactive");
    }

    const packageInfo = packages[0];

    // Use package start_date if booking_date is not provided (Option 2: Fixed Dates)
    const finalBookingDate = booking_date || packageInfo.start_date;

    // Check availability
    if (packageInfo.available_slots < number_of_people) {
      throw new Error("Not enough available slots for this booking");
    }

    // Check if booking date is within package date range
    const bookingDateObj = new Date(finalBookingDate);
    const startDate = new Date(packageInfo.start_date);
    const endDate = new Date(packageInfo.end_date);

    if (bookingDateObj < startDate || bookingDateObj > endDate) {
      throw new Error("Booking date is outside package availability period");
    }

    // Calculate total amount
    const total_amount = packageInfo.price * number_of_people;
    const booking_reference = generateBookingReference();

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Create booking
      const [bookingResult] = await connection.execute(
        `INSERT INTO bookings (
          user_id, package_id, booking_reference, number_of_people, 
          total_amount, booking_date, special_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          package_id,
          booking_reference,
          number_of_people,
          total_amount,
          finalBookingDate,
          special_requests,
        ],
      );

      // Update package available slots
      await connection.execute(
        "UPDATE packages SET available_slots = available_slots - ? WHERE id = ?",
        [number_of_people, package_id],
      );

      await connection.commit();

      const newBooking = await this.getBookingById(bookingResult.insertId);

      // Send notifications
      try {
        // Notify user about booking confirmation
        await NotificationService.notifyBookingConfirmed(userId, {
          package_title: packageInfo.title,
          booking_reference: booking_reference,
        });

        // Notify company about new booking
        const [companyUsers] = await pool.execute(
          "SELECT u.id FROM users u JOIN companies c ON u.id = c.user_id WHERE c.id = ?",
          [packageInfo.company_id],
        );

        if (companyUsers.length > 0) {
          await NotificationService.notifyNewBooking(companyUsers[0].id, {
            package_title: packageInfo.title,
            customer_name: newBooking.name,
          });
        }

        // Emit real-time updates
        emitBookingUpdate(userId, {
          type: "booking_created",
          booking: newBooking,
        });
      } catch (notificationError) {
        console.error(
          "Error sending booking notifications:",
          notificationError,
        );
      }

      return newBooking;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getBookingById(id) {
    const [bookings] = await pool.execute(
      `SELECT 
        b.*,
        p.title as package_title,
        p.location as package_location,
        p.duration_days,
        p.start_date as package_start_date,
        p.end_date as package_end_date,
        c.company_name,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        pay.id as payment_id,
        pay.status as payment_status,
        pay.payment_method,
        pay.amount as payment_amount,
        pay.transaction_reference,
        pay.payment_date
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN companies c ON p.company_id = c.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN payments pay ON b.id = pay.booking_id AND pay.status IN ('pending', 'completed')
      WHERE b.id = ?`,
      [id],
    );

    return bookings.length > 0 ? bookings[0] : null;
  }

  static async getUserBookings(userId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      payment_status,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ["b.user_id = ?"];
    let queryParams = [userId];

    if (status) {
      whereConditions.push("b.status = ?");
      queryParams.push(status);
    }

    if (payment_status) {
      whereConditions.push("pay.status = ?");
      queryParams.push(payment_status);
    }

    const whereClause = whereConditions.join(" AND ");

    const [bookings] = await pool.execute(
      `SELECT 
        b.id,
        b.user_id,
        b.package_id,
        b.booking_reference,
        b.booking_date,
        b.number_of_people,
        b.total_amount,
        b.status,
        b.special_requests,
        b.created_at,
        b.updated_at,
        p.title as package_title,
        p.location as package_location,
        p.duration_days,
        p.images as package_images,
        c.company_name,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        pay.id as payment_id,
        pay.status as payment_status,
        pay.payment_method,
        pay.transaction_reference,
        pay.payment_date,
        CASE WHEN r.id IS NOT NULL THEN true ELSE false END as has_review
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN companies c ON p.company_id = c.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN payments pay ON b.id = pay.booking_id AND pay.status IN ('pending', 'completed', 'failed', 'refunded')
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC, b.id DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM bookings b 
       LEFT JOIN payments pay ON b.id = pay.booking_id AND pay.status IN ('pending', 'completed', 'failed', 'refunded')
       WHERE ${whereClause}`,
      queryParams,
    );

    const total = countResult[0].total;

    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      package_images: booking.package_images
        ? JSON.parse(booking.package_images)
        : [],
    }));

    return {
      items: formattedBookings,
      pagination: {
        page: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  static async getCompanyBookings(companyId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      payment_status,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ["p.company_id = ?"];
    let queryParams = [companyId];

    if (status) {
      whereConditions.push("b.status = ?");
      queryParams.push(status);
    }

    if (payment_status) {
      whereConditions.push("pay.status = ?");
      queryParams.push(payment_status);
    }

    const whereClause = whereConditions.join(" AND ");

    const [bookings] = await pool.execute(
      `SELECT 
        b.*,
        p.title as package_title,
        p.location as package_location,
        p.price as package_price,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        pay.id as payment_id,
        pay.status as payment_status,
        pay.payment_method,
        pay.amount as payment_amount,
        pay.transaction_reference
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN payments pay ON b.id = pay.booking_id AND pay.status IN ('pending', 'completed', 'failed', 'refunded')
      WHERE ${whereClause}
      ORDER BY b.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM bookings b 
       JOIN packages p ON b.package_id = p.id 
       LEFT JOIN payments pay ON b.id = pay.booking_id AND pay.status IN ('pending', 'completed', 'failed', 'refunded')
       WHERE ${whereClause}`,
      queryParams,
    );

    const total = countResult[0].total;

    return {
      items: bookings,
      pagination: {
        page: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  static async updateBookingStatus(
    id,
    status,
    userId = null,
    companyId = null,
  ) {
    let query =
      "UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    let params = [status, id];

    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    } else if (companyId) {
      query = `UPDATE bookings b 
               JOIN packages p ON b.package_id = p.id 
               SET b.status = ?, b.updated_at = CURRENT_TIMESTAMP 
               WHERE b.id = ? AND p.company_id = ?`;
      params = [status, id, companyId];
    }

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      throw new Error("Booking not found or unauthorized");
    }

    // Get booking details for further processing
    const booking = await this.getBookingById(id);

    // If marking as completed, check if package should be deactivated
    if (status === "completed" && booking) {
      try {
        // Check if package end date has passed or if this is the last active booking
        const [packageInfo] = await pool.execute(
          `SELECT 
            p.id,
            p.end_date,
            p.is_active,
            COUNT(CASE WHEN b.status IN ('pending', 'confirmed') THEN 1 END) as active_bookings
           FROM packages p
           LEFT JOIN bookings b ON p.id = b.package_id
           WHERE p.id = ?
           GROUP BY p.id`,
          [booking.package_id],
        );

        if (packageInfo.length > 0) {
          const pkg = packageInfo[0];
          const endDate = new Date(pkg.end_date);
          const now = new Date();

          // Deactivate package if:
          // 1. End date has passed, OR
          // 2. No more active bookings (all completed or cancelled)
          if (endDate < now || pkg.active_bookings === 0) {
            await pool.execute(
              "UPDATE packages SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
              [booking.package_id],
            );
            console.log(
              `📦 Package ${booking.package_id} deactivated - trip completed`,
            );
          }
        }
      } catch (error) {
        console.error("Error checking package status:", error);
        // Don't throw error - booking status update was successful
      }
    }

    // If cancelling, restore available slots
    if (status === "cancelled") {
      if (booking) {
        await pool.execute(
          "UPDATE packages SET available_slots = available_slots + ? WHERE id = ?",
          [booking.number_of_people, booking.package_id],
        );

        // Send cancellation notification
        try {
          await NotificationService.notifyBookingCancelled(booking.user_id, {
            package_title: booking.package_title,
            booking_reference: booking.booking_reference,
          });

          // Emit real-time update
          emitBookingUpdate(booking.user_id, {
            type: "booking_cancelled",
            booking: booking,
          });
        } catch (notificationError) {
          console.error(
            "Error sending cancellation notification:",
            notificationError,
          );
        }
      }
    }

    const updatedBooking = await this.getBookingById(id);

    // Send status update notification for other status changes
    if (status !== "cancelled" && updatedBooking) {
      try {
        await NotificationService.createNotification(updatedBooking.user_id, {
          title: "Booking Status Updated",
          message: `Your booking for "${updatedBooking.package_title}" status has been updated to ${status}`,
          type: "booking_status",
        });

        emitBookingUpdate(updatedBooking.user_id, {
          type: "booking_status_updated",
          booking: updatedBooking,
        });
      } catch (notificationError) {
        console.error(
          "Error sending status update notification:",
          notificationError,
        );
      }
    }

    return updatedBooking;
  }

  static async sendBookingConfirmation(bookingId, companyId) {
    // Get booking details
    const [bookings] = await pool.execute(
      `SELECT 
        b.*,
        p.title as package_title,
        p.location as package_location,
        p.start_date,
        p.end_date,
        u.name as customer_name,
        u.email as customer_email,
        c.company_name
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
      JOIN companies c ON p.company_id = c.id
      WHERE b.id = ? AND p.company_id = ?`,
      [bookingId, companyId],
    );

    if (bookings.length === 0) {
      throw new Error("Booking not found or unauthorized");
    }

    const booking = bookings[0];

    try {
      // Send confirmation notification to customer
      await NotificationService.createNotification(booking.user_id, {
        title: "Booking Confirmation",
        message: `Your booking for "${booking.package_title}" has been confirmed by ${booking.company_name}. Booking reference: ${booking.booking_reference}`,
        type: "booking_confirmed",
        data: {
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          package_title: booking.package_title,
        },
      });

      // Emit real-time update
      emitBookingUpdate(booking.user_id, {
        type: "booking_confirmation_sent",
        booking: booking,
      });

      return {
        success: true,
        message: "Booking confirmation sent successfully",
        booking: booking,
      };
    } catch (error) {
      console.error("Error sending booking confirmation:", error);
      throw new Error("Failed to send booking confirmation");
    }
  }

  static async refundBooking(id, companyId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get booking details with package and payment info
      const [bookings] = await connection.execute(
        `SELECT 
          b.*,
          p.title as package_title,
          p.id as package_id,
          u.name as customer_name,
          u.email as customer_email,
          pay.id as payment_id,
          pay.status as payment_status,
          pay.amount as payment_amount,
          pay.payment_method
        FROM bookings b
        JOIN packages p ON b.package_id = p.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN payments pay ON b.id = pay.booking_id
        WHERE b.id = ? AND p.company_id = ?`,
        [id, companyId],
      );

      if (bookings.length === 0) {
        throw new Error("Booking not found or unauthorized");
      }

      const booking = bookings[0];

      // Validate refund eligibility
      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      if (booking.status === "completed") {
        throw new Error(
          "Cannot refund completed bookings. Please contact support for assistance.",
        );
      }

      // Check payment status - only refund if payment was completed
      if (!booking.payment_id) {
        throw new Error(
          "No payment found for this booking. Use cancel instead of refund.",
        );
      }

      if (booking.payment_status !== "completed") {
        throw new Error(
          `Cannot refund ${booking.payment_status} payment. Only completed payments can be refunded.`,
        );
      }

      if (booking.payment_status === "refunded") {
        throw new Error("Payment has already been refunded");
      }

      // Update booking status to cancelled
      await connection.execute(
        "UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
      );

      // Update payment status to refunded
      await connection.execute(
        "UPDATE payments SET status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [booking.payment_id],
      );

      // Restore available slots to the package
      await connection.execute(
        "UPDATE packages SET available_slots = available_slots + ? WHERE id = ?",
        [booking.number_of_people, booking.package_id],
      );

      await connection.commit();

      // Send refund notification
      try {
        await NotificationService.createNotification(booking.user_id, {
          title: "Booking Refunded",
          message: `Your booking for "${booking.package_title}" has been refunded. Amount: ${booking.payment_amount} ETB via ${booking.payment_method}. Refund will be processed within 3-5 business days.`,
          type: "booking_refunded",
          data: {
            booking_id: booking.id,
            booking_reference: booking.booking_reference,
            refund_amount: booking.payment_amount,
            payment_method: booking.payment_method,
          },
        });

        // Emit real-time update
        emitBookingUpdate(booking.user_id, {
          type: "booking_refunded",
          booking: booking,
        });
      } catch (notificationError) {
        console.error("Error sending refund notification:", notificationError);
      }

      return {
        success: true,
        message: "Booking refunded successfully",
        data: {
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          refund_amount: booking.payment_amount,
          payment_method: booking.payment_method,
          slots_restored: booking.number_of_people,
          original_status: booking.status,
          new_status: "cancelled",
          payment_status: "refunded",
        },
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getBookingStats(companyId) {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(CASE WHEN pay.status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
        SUM(CASE WHEN pay.status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
        SUM(CASE WHEN pay.status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
        SUM(CASE WHEN pay.status = 'completed' THEN b.total_amount ELSE 0 END) as total_revenue
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      LEFT JOIN payments pay ON b.id = pay.booking_id
      WHERE p.company_id = ?`,
      [companyId],
    );

    return (
      stats[0] || {
        total_bookings: 0,
        pending_bookings: 0,
        confirmed_bookings: 0,
        completed_bookings: 0,
        cancelled_bookings: 0,
        pending_payments: 0,
        completed_payments: 0,
        failed_payments: 0,
        total_revenue: 0,
      }
    );
  }

  static async cancelBooking(id, userId) {
    // Check if booking can be cancelled (not already completed or cancelled)
    const [bookings] = await pool.execute(
      "SELECT status FROM bookings WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (bookings.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookings[0];
    if (booking.status === "completed" || booking.status === "cancelled") {
      throw new Error(`Cannot cancel booking with status: ${booking.status}`);
    }

    return await this.updateBookingStatus(id, "cancelled", userId);
  }
}
