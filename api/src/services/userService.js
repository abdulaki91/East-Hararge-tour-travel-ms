import pool from "../config/database.js";
import { hashPassword } from "../utils/bcrypt.js";

export class UserService {
  static async getUserProfile(userId) {
    const [users] = await pool.execute(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.created_at, u.updated_at,
        r.name as role_name,
        c.company_name, c.description as company_description, 
        c.address as company_address, c.is_verified as company_verified
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN companies c ON u.id = c.user_id
      WHERE u.id = ? AND u.is_active = true`,
      [userId],
    );

    if (users.length === 0) {
      throw new Error("User not found");
    }

    return users[0];
  }

  static async updateProfile(userId, profileData) {
    const { name, email, phone } = profileData;

    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await pool.execute(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId],
      );

      if (existingUsers.length > 0) {
        throw new Error("Email is already taken");
      }
    }

    const [result] = await pool.execute(
      `UPDATE users 
       SET name = COALESCE(?, name), 
           email = COALESCE(?, email), 
           phone = COALESCE(?, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, phone, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }

    return await this.getUserProfile(userId);
  }

  static async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    // Get current password hash
    const [users] = await pool.execute(
      "SELECT password FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      throw new Error("User not found");
    }

    // Verify current password
    const bcrypt = await import("bcrypt");
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      users[0].password,
    );

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    const [result] = await pool.execute(
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedNewPassword, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update password");
    }

    return { success: true, message: "Password updated successfully" };
  }

  static async updateCompanyProfile(userId, companyData) {
    const { company_name, description, address, phone, website } = companyData;

    // Check if user is a company
    const [users] = await pool.execute(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [userId],
    );

    if (users.length === 0 || users[0].role_name !== "COMPANY") {
      throw new Error("User is not a company or not found");
    }

    // Update company information
    const [result] = await pool.execute(
      `UPDATE companies 
       SET company_name = COALESCE(?, company_name),
           description = COALESCE(?, description),
           address = COALESCE(?, address),
           phone = COALESCE(?, phone),
           website = COALESCE(?, website),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [company_name, description, address, phone, website, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Company not found");
    }

    return await this.getUserProfile(userId);
  }

  static async getUserStats(userId) {
    // Get user's booking statistics
    const [bookingStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COALESCE(SUM(total_amount), 0) as total_spent
      FROM bookings 
      WHERE user_id = ?`,
      [userId],
    );

    // Get user's review statistics
    const [reviewStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating
      FROM reviews 
      WHERE user_id = ?`,
      [userId],
    );

    // Get recent bookings
    const [recentBookings] = await pool.execute(
      `SELECT 
        b.id, b.booking_reference, b.status, b.total_amount, b.booking_date,
        p.title as package_title, p.location
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 5`,
      [userId],
    );

    return {
      bookings: {
        ...bookingStats[0],
        total_spent: parseFloat(bookingStats[0].total_spent),
      },
      reviews: {
        ...reviewStats[0],
        average_rating: parseFloat(reviewStats[0].average_rating),
      },
      recent_bookings: recentBookings,
    };
  }

  static async getUserNotificationPreferences(userId) {
    // Check if preferences exist
    const [preferences] = await pool.execute(
      "SELECT * FROM user_notification_preferences WHERE user_id = ?",
      [userId],
    );

    if (preferences.length === 0) {
      // Create default preferences
      await pool.execute(
        `INSERT INTO user_notification_preferences 
         (user_id, email_notifications, sms_notifications, push_notifications, booking_updates, payment_updates, promotional_offers)
         VALUES (?, true, true, true, true, true, false)`,
        [userId],
      );

      return {
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        booking_updates: true,
        payment_updates: true,
        promotional_offers: false,
      };
    }

    return preferences[0];
  }

  static async updateNotificationPreferences(userId, preferences) {
    const {
      email_notifications,
      sms_notifications,
      push_notifications,
      booking_updates,
      payment_updates,
      promotional_offers,
    } = preferences;

    // Upsert preferences
    const [result] = await pool.execute(
      `INSERT INTO user_notification_preferences 
       (user_id, email_notifications, sms_notifications, push_notifications, 
        booking_updates, payment_updates, promotional_offers)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       email_notifications = VALUES(email_notifications),
       sms_notifications = VALUES(sms_notifications),
       push_notifications = VALUES(push_notifications),
       booking_updates = VALUES(booking_updates),
       payment_updates = VALUES(payment_updates),
       promotional_offers = VALUES(promotional_offers)`,
      [
        userId,
        email_notifications,
        sms_notifications,
        push_notifications,
        booking_updates,
        payment_updates,
        promotional_offers,
      ],
    );

    return await this.getUserNotificationPreferences(userId);
  }

  static async deleteAccount(userId, password) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verify password
      const [users] = await connection.execute(
        "SELECT password, role_id FROM users WHERE id = ?",
        [userId],
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      const bcrypt = await import("bcrypt");
      const isValidPassword = await bcrypt.compare(password, users[0].password);

      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      // Get role to determine cleanup needed
      const [roles] = await connection.execute(
        "SELECT name FROM roles WHERE id = ?",
        [users[0].role_id],
      );

      const roleName = roles[0].name;

      // If company user, delete company data
      if (roleName === "COMPANY") {
        // Delete company packages (this will cascade to bookings)
        await connection.execute("DELETE FROM packages WHERE company_id = ?", [
          userId,
        ]);

        // Delete company record
        await connection.execute("DELETE FROM companies WHERE user_id = ?", [
          userId,
        ]);
      }

      // Delete user's data
      await connection.execute("DELETE FROM reviews WHERE user_id = ?", [
        userId,
      ]);
      await connection.execute("DELETE FROM notifications WHERE user_id = ?", [
        userId,
      ]);
      await connection.execute(
        "DELETE FROM user_notification_preferences WHERE user_id = ?",
        [userId],
      );

      // Delete payments for user's bookings
      await connection.execute(
        "DELETE p FROM payments p JOIN bookings b ON p.booking_id = b.id WHERE b.user_id = ?",
        [userId],
      );

      // Delete user's bookings
      await connection.execute("DELETE FROM bookings WHERE user_id = ?", [
        userId,
      ]);

      // Finally delete the user
      await connection.execute("DELETE FROM users WHERE id = ?", [userId]);

      await connection.commit();
      return { success: true, message: "Account deleted successfully" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
