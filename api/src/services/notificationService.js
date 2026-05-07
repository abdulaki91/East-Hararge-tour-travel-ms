import pool from "../config/database.js";
import { emitNotificationToUser } from "../socket/index.js";

export class NotificationService {
  static async createNotification(userId, notificationData) {
    const { title, message, type } = notificationData;

    const [result] = await pool.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [userId, title, message, type],
    );

    const newNotification = await this.getNotificationById(result.insertId);

    // Emit real-time notification with enhanced functionality
    if (newNotification) {
      emitNotificationToUser(userId, newNotification);
    }

    return newNotification;
  }

  static async getNotificationById(id) {
    const [notifications] = await pool.execute(
      "SELECT * FROM notifications WHERE id = ?",
      [id],
    );

    return notifications.length > 0 ? notifications[0] : null;
  }

  static async getUserNotifications(userId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      is_read,
      type,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ["user_id = ?"];
    let queryParams = [userId];

    if (is_read !== undefined) {
      whereConditions.push("is_read = ?");
      queryParams.push(is_read);
    }

    if (type) {
      whereConditions.push("type = ?");
      queryParams.push(type);
    }

    const whereClause = whereConditions.join(" AND ");

    const [notifications] = await pool.execute(
      `SELECT * FROM notifications 
       WHERE ${whereClause}
       ORDER BY ${sort_by} ${sort_order.toUpperCase()}
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM notifications WHERE ${whereClause}`,
      queryParams,
    );

    const total = countResult[0].total;

    return {
      notifications,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  static async markAsRead(notificationId, userId) {
    const [result] = await pool.execute(
      "UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?",
      [notificationId, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Notification not found or unauthorized");
    }

    return await this.getNotificationById(notificationId);
  }

  static async markAllAsRead(userId) {
    const [result] = await pool.execute(
      "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false",
      [userId],
    );

    return result.affectedRows;
  }

  static async deleteNotification(notificationId, userId) {
    const [result] = await pool.execute(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?",
      [notificationId, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Notification not found or unauthorized");
    }

    return true;
  }

  static async getUnreadCount(userId) {
    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
      [userId],
    );

    return result[0].count;
  }

  // Helper methods for creating specific notification types
  static async notifyBookingConfirmed(userId, bookingData) {
    return await this.createNotification(userId, {
      title: "Booking Confirmed",
      message: `Your booking for "${bookingData.package_title}" has been confirmed. Booking reference: ${bookingData.booking_reference}`,
      type: "booking_confirmed",
    });
  }

  static async notifyPaymentCompleted(userId, paymentData) {
    return await this.createNotification(userId, {
      title: "Payment Successful",
      message: `Your payment of $${paymentData.amount} has been processed successfully. Transaction reference: ${paymentData.transaction_reference}`,
      type: "payment_completed",
    });
  }

  static async notifyPaymentFailed(userId, paymentData) {
    return await this.createNotification(userId, {
      title: "Payment Failed",
      message: `Your payment of $${paymentData.amount} could not be processed. Please try again or contact support.`,
      type: "payment_failed",
    });
  }

  static async notifyRefundProcessed(userId, refundData) {
    return await this.createNotification(userId, {
      title: "Refund Processed",
      message: `Your refund of $${refundData.amount} has been processed. Transaction reference: ${refundData.transaction_reference}. Expected completion: ${refundData.estimated_completion}`,
      type: "refund_processed",
    });
  }

  static async notifyBookingCancelled(userId, bookingData) {
    return await this.createNotification(userId, {
      title: "Booking Cancelled",
      message: `Your booking for "${bookingData.package_title}" has been cancelled. Booking reference: ${bookingData.booking_reference}`,
      type: "booking_cancelled",
    });
  }

  static async notifyNewBooking(companyUserId, bookingData) {
    return await this.createNotification(companyUserId, {
      title: "New Booking Received",
      message: `You have received a new booking for "${bookingData.package_title}" from ${bookingData.customer_name}`,
      type: "new_booking",
    });
  }

  static async bulkMarkAsRead(userId, notificationIds) {
    if (notificationIds.length === 0) {
      return 0;
    }

    const placeholders = notificationIds.map(() => "?").join(",");
    const [result] = await pool.execute(
      `UPDATE notifications 
       SET is_read = true, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ? AND id IN (${placeholders}) AND is_read = false`,
      [userId, ...notificationIds],
    );

    return result.affectedRows;
  }

  // ============================================
  // ADMIN NOTIFICATION METHODS
  // ============================================

  /**
   * Notify all admin users about an event
   */
  static async notifyAllAdmins(notificationData) {
    const { title, message, type } = notificationData;

    // Get all admin user IDs
    const [admins] = await pool.execute(
      `SELECT u.id FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE r.name = 'ADMIN' AND u.is_active = true`,
    );

    if (admins.length === 0) {
      console.warn("No active admin users found to notify");
      return [];
    }

    // Create notifications for all admins
    const notifications = [];
    for (const admin of admins) {
      try {
        const notification = await this.createNotification(admin.id, {
          title,
          message,
          type,
        });
        notifications.push(notification);
      } catch (error) {
        console.error(
          `Failed to create notification for admin ${admin.id}:`,
          error,
        );
      }
    }

    return notifications;
  }

  /**
   * Notify admins about new company registration
   */
  static async notifyAdminsNewCompanyRegistration(companyData) {
    return await this.notifyAllAdmins({
      title: "New Company Registration",
      message: `${companyData.company_name} has registered and is awaiting verification. Owner: ${companyData.owner_name} (${companyData.owner_email})`,
      type: "info",
    });
  }

  /**
   * Notify admins about suspicious activity
   */
  static async notifyAdminsSuspiciousActivity(activityData) {
    return await this.notifyAllAdmins({
      title: "Suspicious Activity Detected",
      message: `${activityData.description}. User: ${activityData.user_email || "Unknown"}`,
      type: "error",
    });
  }

  /**
   * Notify admins about system errors
   */
  static async notifyAdminsSystemError(errorData) {
    return await this.notifyAllAdmins({
      title: "System Error",
      message: `${errorData.error_type}: ${errorData.message}. Location: ${errorData.location}`,
      type: "error",
    });
  }
}
