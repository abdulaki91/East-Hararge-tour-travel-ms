import pool from "../config/database.js";
import { hashPassword } from "../utils/bcrypt.js";

export class AdminService {
  static async getDashboardStats() {
    // Get total users
    const [userStats] = await pool.execute(
      "SELECT COUNT(*) as total_users FROM users WHERE is_active = true",
    );

    // Get total companies
    const [companyStats] = await pool.execute(
      "SELECT COUNT(*) as total_companies FROM companies",
    );

    // Get pending companies
    const [pendingCompanies] = await pool.execute(
      "SELECT COUNT(*) as pending_companies FROM companies WHERE is_verified = false",
    );

    // Get total packages
    const [packageStats] = await pool.execute(
      "SELECT COUNT(*) as total_packages FROM packages",
    );

    // Get active packages
    const [activePackages] = await pool.execute(
      "SELECT COUNT(*) as active_packages FROM packages WHERE is_active = true",
    );

    // Get total bookings
    const [bookingStats] = await pool.execute(
      "SELECT COUNT(*) as total_bookings FROM bookings",
    );

    // Get total revenue
    const [revenueStats] = await pool.execute(
      `SELECT COALESCE(SUM(p.amount), 0) as total_revenue 
       FROM payments p 
       WHERE p.status = 'completed'`,
    );

    // Get monthly revenue for the last 12 months
    const [monthlyRevenue] = await pool.execute(
      `SELECT 
        DATE_FORMAT(p.payment_date, '%Y-%m') as month,
        SUM(p.amount) as revenue
      FROM payments p
      WHERE p.status = 'completed' 
        AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
      ORDER BY month ASC`,
    );

    // Get booking status distribution
    const [bookingStatusStats] = await pool.execute(
      `SELECT 
        status,
        COUNT(*) as count
      FROM bookings
      GROUP BY status`,
    );

    // Get top packages by bookings
    const [topPackages] = await pool.execute(
      `SELECT 
        p.id,
        p.title,
        p.location,
        COUNT(b.id) as booking_count,
        SUM(b.total_amount) as total_revenue
      FROM packages p
      LEFT JOIN bookings b ON p.id = b.package_id
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY booking_count DESC
      LIMIT 10`,
    );

    return {
      overview: {
        total_users: userStats[0].total_users,
        total_companies: companyStats[0].total_companies,
        pending_companies: pendingCompanies[0].pending_companies,
        total_packages: packageStats[0].total_packages,
        active_packages: activePackages[0].active_packages,
        total_bookings: bookingStats[0].total_bookings,
        total_revenue: parseFloat(revenueStats[0].total_revenue),
      },
      monthly_revenue: monthlyRevenue.map((item) => ({
        month: item.month,
        revenue: parseFloat(item.revenue),
      })),
      booking_status_distribution: bookingStatusStats.map((item) => ({
        status: item.status,
        count: parseInt(item.count),
      })),
      top_packages: topPackages.map((item) => ({
        ...item,
        booking_count: parseInt(item.booking_count),
        total_revenue: parseFloat(item.total_revenue || 0),
      })),
    };
  }

  static async getAllUsers(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      status = "",
    } = filters;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      whereClause += " AND (u.name LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += " AND r.name = ?";
      params.push(role);
    }

    if (status !== "") {
      whereClause += " AND u.is_active = ?";
      params.push(status === "active");
    }

    const [users] = await pool.execute(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
        r.name as role_name,
        c.company_name, c.is_verified as company_verified
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN companies c ON u.id = c.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN companies c ON u.id = c.user_id
      ${whereClause}`,
      params,
    );

    return {
      items: users,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  static async updateUserStatus(userId, isActive) {
    const [result] = await pool.execute(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [isActive, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }

    return { success: true, message: "User status updated successfully" };
  }

  static async deleteUser(userId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if user exists and get role
      const [users] = await connection.execute(
        "SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
        [userId],
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      const user = users[0];

      // If company user, delete company data first
      if (user.role_name === "COMPANY") {
        // Delete company packages (this will cascade to bookings)
        await connection.execute("DELETE FROM packages WHERE company_id = ?", [
          userId,
        ]);

        // Delete company record
        await connection.execute("DELETE FROM companies WHERE user_id = ?", [
          userId,
        ]);
      }

      // Delete user's bookings and related data
      await connection.execute("DELETE FROM reviews WHERE user_id = ?", [
        userId,
      ]);
      await connection.execute("DELETE FROM notifications WHERE user_id = ?", [
        userId,
      ]);

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
      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAllCompanies(filters = {}) {
    const { page = 1, limit = 10, search = "", status = "" } = filters;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      whereClause += " AND (c.company_name LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== "") {
      whereClause += " AND c.is_verified = ?";
      params.push(status === "verified");
    }

    const [companies] = await pool.execute(
      `SELECT 
        c.*, u.name as name, u.email as user_email, u.phone, u.is_active,
        COUNT(p.id) as package_count,
        COUNT(CASE WHEN p.is_active = true THEN 1 END) as active_packages
      FROM companies c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN packages p ON c.user_id = p.company_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total
      FROM companies c
      JOIN users u ON c.user_id = u.id
      ${whereClause}`,
      params,
    );

    return {
      items: companies,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  static async verifyCompany(companyId, isVerified) {
    const [result] = await pool.execute(
      "UPDATE companies SET is_verified = ? WHERE id = ?",
      [isVerified, companyId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Company not found");
    }

    return {
      success: true,
      message: "Company verification status updated successfully",
    };
  }

  // Verify/Reject company with reason (NEW)
  static async verifyCompanyWithReason(companyId, verificationData) {
    const { is_verified, rejection_reason } = verificationData;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get company details
      const [companies] = await connection.execute(
        `SELECT c.*, u.email, u.name 
         FROM companies c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [companyId],
      );

      if (companies.length === 0) {
        throw new Error("Company not found");
      }

      const company = companies[0];

      // Update verification status
      await connection.execute(
        "UPDATE companies SET is_verified = ? WHERE id = ?",
        [is_verified, companyId],
      );

      // If rejected, create notification
      if (!is_verified && rejection_reason) {
        await connection.execute(
          `INSERT INTO notifications (user_id, title, message, type) 
           VALUES (?, ?, ?, ?)`,
          [
            company.user_id,
            "Company Verification Rejected",
            `Your company "${company.company_name}" verification was rejected. Reason: ${rejection_reason}`,
            "error",
          ],
        );
      }

      // If approved, create notification
      if (is_verified) {
        await connection.execute(
          `INSERT INTO notifications (user_id, title, message, type) 
           VALUES (?, ?, ?, ?)`,
          [
            company.user_id,
            "Company Verified Successfully",
            `Congratulations! Your company "${company.company_name}" has been verified. You can now create packages and receive bookings.`,
            "success",
          ],
        );
      }

      await connection.commit();

      return {
        success: true,
        message: is_verified
          ? "Company verified successfully"
          : "Company verification rejected",
        company,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteCompany(companyId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get company user ID
      const [companies] = await connection.execute(
        "SELECT user_id FROM companies WHERE id = ?",
        [companyId],
      );

      if (companies.length === 0) {
        throw new Error("Company not found");
      }

      const userId = companies[0].user_id;

      // Delete company packages and related data
      await connection.execute("DELETE FROM packages WHERE company_id = ?", [
        userId,
      ]);

      // Delete company record
      await connection.execute("DELETE FROM companies WHERE id = ?", [
        companyId,
      ]);

      // Delete the user account
      await connection.execute("DELETE FROM users WHERE id = ?", [userId]);

      await connection.commit();
      return { success: true, message: "Company deleted successfully" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAllReviews(filters = {}) {
    const { page = 1, limit = 10, search = "", rating = "" } = filters;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      whereClause +=
        " AND (p.title LIKE ? OR u.name LIKE ? OR r.comment LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (rating) {
      whereClause += " AND r.rating = ?";
      params.push(parseInt(rating));
    }

    const [reviews] = await pool.execute(
      `SELECT 
        r.*, u.name as user_name, p.title as package_title,
        c.company_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      JOIN companies c ON p.company_id = c.user_id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      JOIN companies c ON p.company_id = c.user_id
      ${whereClause}`,
      params,
    );

    return {
      items: reviews,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  static async deleteReview(reviewId) {
    const [result] = await pool.execute("DELETE FROM reviews WHERE id = ?", [
      reviewId,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Review not found");
    }

    return { success: true, message: "Review deleted successfully" };
  }

  static async getSystemHealth() {
    try {
      // Test database connection
      const [dbTest] = await pool.execute("SELECT 1 as test");

      // Get system stats
      const [userCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM users",
      );
      const [companyCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM companies",
      );
      const [packageCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM packages",
      );
      const [bookingCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM bookings",
      );

      return {
        database: {
          status: "healthy",
          connection: "active",
          last_check: new Date().toISOString(),
        },
        system: {
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          node_version: process.version,
          environment: process.env.NODE_ENV || "development",
        },
        statistics: {
          total_users: userCount[0].count,
          total_companies: companyCount[0].count,
          total_packages: packageCount[0].count,
          total_bookings: bookingCount[0].count,
        },
      };
    } catch (error) {
      return {
        database: {
          status: "unhealthy",
          connection: "failed",
          error: error.message,
          last_check: new Date().toISOString(),
        },
        system: {
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          node_version: process.version,
          environment: process.env.NODE_ENV || "development",
        },
      };
    }
  }

  static async generateReport(type, filters = {}) {
    const { startDate, endDate } = filters;

    switch (type) {
      case "revenue":
        return await this.generateRevenueReport(startDate, endDate);
      case "bookings":
        return await this.generateBookingsReport(startDate, endDate);
      case "users":
        return await this.generateUsersReport(startDate, endDate);
      case "companies":
        return await this.generateCompaniesReport(startDate, endDate);
      default:
        throw new Error("Invalid report type");
    }
  }

  static async generateRevenueReport(startDate, endDate) {
    const dateFilter =
      startDate && endDate ? "AND p.payment_date BETWEEN ? AND ?" : "";
    const params = startDate && endDate ? [startDate, endDate] : [];

    const [revenue] = await pool.execute(
      `SELECT 
        DATE(p.payment_date) as date,
        COUNT(p.id) as transaction_count,
        SUM(p.amount) as total_revenue,
        AVG(p.amount) as avg_transaction
      FROM payments p
      WHERE p.status = 'completed' ${dateFilter}
      GROUP BY DATE(p.payment_date)
      ORDER BY date DESC`,
      params,
    );

    const [summary] = await pool.execute(
      `SELECT 
        COUNT(p.id) as total_transactions,
        SUM(p.amount) as total_revenue,
        AVG(p.amount) as avg_transaction,
        MIN(p.amount) as min_transaction,
        MAX(p.amount) as max_transaction
      FROM payments p
      WHERE p.status = 'completed' ${dateFilter}`,
      params,
    );

    return {
      type: "revenue",
      period: { startDate, endDate },
      summary: summary[0],
      data: revenue.map((item) => ({
        ...item,
        total_revenue: parseFloat(item.total_revenue),
        avg_transaction: parseFloat(item.avg_transaction),
      })),
    };
  }

  static async generateBookingsReport(startDate, endDate) {
    const dateFilter =
      startDate && endDate ? "AND b.created_at BETWEEN ? AND ?" : "";
    const params = startDate && endDate ? [startDate, endDate] : [];

    const [bookings] = await pool.execute(
      `SELECT 
        DATE(b.created_at) as date,
        COUNT(b.id) as booking_count,
        SUM(b.total_amount) as total_value,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_count
      FROM bookings b
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(b.created_at)
      ORDER BY date DESC`,
      params,
    );

    const [statusDistribution] = await pool.execute(
      `SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total_value
      FROM bookings b
      WHERE 1=1 ${dateFilter}
      GROUP BY status`,
      params,
    );

    return {
      type: "bookings",
      period: { startDate, endDate },
      data: bookings.map((item) => ({
        ...item,
        total_value: parseFloat(item.total_value || 0),
      })),
      status_distribution: statusDistribution.map((item) => ({
        ...item,
        total_value: parseFloat(item.total_value || 0),
      })),
    };
  }

  static async generateUsersReport(startDate, endDate) {
    const dateFilter =
      startDate && endDate ? "AND u.created_at BETWEEN ? AND ?" : "";
    const params = startDate && endDate ? [startDate, endDate] : [];

    const [users] = await pool.execute(
      `SELECT 
        DATE(u.created_at) as date,
        COUNT(u.id) as new_users,
        COUNT(CASE WHEN r.name = 'USER' THEN 1 END) as regular_users,
        COUNT(CASE WHEN r.name = 'COMPANY' THEN 1 END) as company_users
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(u.created_at)
      ORDER BY date DESC`,
      params,
    );

    const [roleDistribution] = await pool.execute(
      `SELECT 
        r.name as role,
        COUNT(u.id) as count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1 ${dateFilter}
      GROUP BY r.name`,
      params,
    );

    return {
      type: "users",
      period: { startDate, endDate },
      data: users,
      role_distribution: roleDistribution,
    };
  }

  static async generateCompaniesReport(startDate, endDate) {
    const dateFilter =
      startDate && endDate ? "AND c.created_at BETWEEN ? AND ?" : "";
    const params = startDate && endDate ? [startDate, endDate] : [];

    const [companies] = await pool.execute(
      `SELECT 
        c.*,
        u.name as owner_name,
        u.email,
        COUNT(p.id) as total_packages,
        COUNT(CASE WHEN p.is_active = true THEN 1 END) as active_packages,
        COALESCE(SUM(b.total_amount), 0) as total_revenue
      FROM companies c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN packages p ON c.user_id = p.company_id
      LEFT JOIN bookings b ON p.id = b.package_id
      WHERE 1=1 ${dateFilter}
      GROUP BY c.id
      ORDER BY total_revenue DESC`,
      params,
    );

    return {
      type: "companies",
      period: { startDate, endDate },
      data: companies.map((item) => ({
        ...item,
        total_revenue: parseFloat(item.total_revenue || 0),
      })),
    };
  }

  // Notifications Management
  static async getAllNotifications(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      type = "",
      is_read = "",
      user_id = "",
    } = filters;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      whereClause += " AND (n.title LIKE ? OR n.message LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
      whereClause += " AND n.type = ?";
      params.push(type);
    }

    if (is_read !== "") {
      whereClause += " AND n.is_read = ?";
      params.push(is_read === "true");
    }

    if (user_id) {
      whereClause += " AND n.user_id = ?";
      params.push(user_id);
    }

    const [notifications] = await pool.execute(
      `SELECT 
        n.*,
        u.name as first_name,
        '' as last_name,
        u.email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ${whereClause}`,
      params,
    );

    return {
      items: notifications,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  static async sendBulkNotification(notificationData) {
    const { title, message, type, user_ids, send_to_all } = notificationData;

    let targetUserIds = [];

    if (send_to_all) {
      // Get all active user IDs
      const [users] = await pool.execute(
        "SELECT id FROM users WHERE is_active = true",
      );
      targetUserIds = users.map((user) => user.id);
    } else if (user_ids && user_ids.length > 0) {
      targetUserIds = user_ids;
    } else {
      throw new Error("No target users specified");
    }

    // Insert notifications for all target users
    const values = targetUserIds.map((userId) => [
      userId,
      title,
      message,
      type,
    ]);

    if (values.length > 0) {
      const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
      const flatValues = values.flat();

      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type) VALUES ${placeholders}`,
        flatValues,
      );
    }

    return {
      success: true,
      message: `Bulk notification sent to ${targetUserIds.length} users`,
    };
  }

  static async deleteNotification(notificationId) {
    const [result] = await pool.execute(
      "DELETE FROM notifications WHERE id = ?",
      [notificationId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Notification not found");
    }

    return { success: true, message: "Notification deleted successfully" };
  }

  // Settings Management
  static async getSettings() {
    try {
      const [settings] = await pool.execute(
        "SELECT setting_key, setting_value, setting_type FROM system_settings ORDER BY category, setting_key",
      );

      // Convert database rows to object
      const settingsObject = {};

      for (const setting of settings) {
        const { setting_key, setting_value, setting_type } = setting;

        // Parse value based on type
        let parsedValue = setting_value;

        switch (setting_type) {
          case "boolean":
            parsedValue = setting_value === "true";
            break;
          case "number":
            parsedValue = parseFloat(setting_value);
            break;
          case "json":
            try {
              parsedValue = JSON.parse(setting_value);
            } catch (e) {
              parsedValue = setting_value;
            }
            break;
          default:
            parsedValue = setting_value;
        }

        settingsObject[setting_key] = parsedValue;
      }

      return settingsObject;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  }

  static async updateSettings(settingsData) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const [key, value] of Object.entries(settingsData)) {
        // Get the setting type from database
        const [existingSetting] = await connection.execute(
          "SELECT setting_type FROM system_settings WHERE setting_key = ?",
          [key],
        );

        if (existingSetting.length === 0) {
          // Setting doesn't exist, skip it
          console.warn(`Setting key "${key}" not found in database`);
          continue;
        }

        const settingType = existingSetting[0].setting_type;

        // Convert value to string based on type
        let stringValue;

        switch (settingType) {
          case "boolean":
            stringValue = value ? "true" : "false";
            break;
          case "number":
            stringValue = String(value);
            break;
          case "json":
            stringValue = JSON.stringify(value);
            break;
          default:
            stringValue = String(value);
        }

        // Update the setting
        await connection.execute(
          "UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?",
          [stringValue, key],
        );
      }

      await connection.commit();

      // Return updated settings
      return await this.getSettings();
    } catch (error) {
      await connection.rollback();
      console.error("Error updating settings:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get a single setting value
  static async getSetting(key) {
    try {
      const [settings] = await pool.execute(
        "SELECT setting_value, setting_type FROM system_settings WHERE setting_key = ?",
        [key],
      );

      if (settings.length === 0) {
        return null;
      }

      const { setting_value, setting_type } = settings[0];

      // Parse value based on type
      switch (setting_type) {
        case "boolean":
          return setting_value === "true";
        case "number":
          return parseFloat(setting_value);
        case "json":
          try {
            return JSON.parse(setting_value);
          } catch (e) {
            return setting_value;
          }
        default:
          return setting_value;
      }
    } catch (error) {
      console.error(`Error fetching setting "${key}":`, error);
      return null;
    }
  }

  // Update a single setting
  static async updateSetting(key, value) {
    try {
      const [existingSetting] = await pool.execute(
        "SELECT setting_type FROM system_settings WHERE setting_key = ?",
        [key],
      );

      if (existingSetting.length === 0) {
        throw new Error(`Setting key "${key}" not found`);
      }

      const settingType = existingSetting[0].setting_type;

      // Convert value to string based on type
      let stringValue;

      switch (settingType) {
        case "boolean":
          stringValue = value ? "true" : "false";
          break;
        case "number":
          stringValue = String(value);
          break;
        case "json":
          stringValue = JSON.stringify(value);
          break;
        default:
          stringValue = String(value);
      }

      await pool.execute(
        "UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?",
        [stringValue, key],
      );

      return { success: true, message: "Setting updated successfully" };
    } catch (error) {
      console.error(`Error updating setting "${key}":`, error);
      throw error;
    }
  }

  static async getSystemLogs(filters = {}) {
    const {
      page = 1,
      limit = 50,
      level = "",
      start_date = "",
      end_date = "",
    } = filters;
    const offset = (page - 1) * limit;

    // For now, return mock log data. In a real app, you'd have a logs table
    const mockLogs = [
      {
        id: 1,
        level: "info",
        message: "User login successful",
        timestamp: new Date().toISOString(),
        user_id: 1,
        ip_address: "192.168.1.1",
      },
      {
        id: 2,
        level: "warning",
        message: "Failed login attempt",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user_id: null,
        ip_address: "192.168.1.100",
      },
      {
        id: 3,
        level: "error",
        message: "Database connection timeout",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user_id: null,
        ip_address: null,
      },
    ];

    return {
      items: mockLogs,
      total: mockLogs.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(mockLogs.length / limit),
    };
  }

  // User Creation
  static async createUser(userData) {
    const { name, email, password, phone, role = "USER" } = userData;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      throw new Error("User with this email already exists");
    }

    // Get role ID
    const [roles] = await pool.execute("SELECT id FROM roles WHERE name = ?", [
      role,
    ]);

    if (roles.length === 0) {
      throw new Error("Invalid role specified");
    }

    const roleId = roles[0].id;

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, phone, role_id, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, true, true)`,
      [name, email, hashedPassword, phone, roleId],
    );

    // Get created user
    const [newUser] = await pool.execute(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [result.insertId],
    );

    const user = newUser[0];
    delete user.password; // Remove password from response

    return user;
  }

  // User Update
  static async updateUser(userId, userData) {
    const { name, email, phone, role } = userData;

    // Check if user exists
    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId],
    );

    if (existingUser.length === 0) {
      throw new Error("User not found");
    }

    // Check if email is already taken by another user
    if (email) {
      const [emailCheck] = await pool.execute(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId],
      );

      if (emailCheck.length > 0) {
        throw new Error("Email is already taken by another user");
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }

    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email);
    }

    if (phone !== undefined) {
      updates.push("phone = ?");
      params.push(phone);
    }

    if (role !== undefined) {
      // Get role ID
      const [roles] = await pool.execute(
        "SELECT id FROM roles WHERE name = ?",
        [role],
      );

      if (roles.length === 0) {
        throw new Error("Invalid role specified");
      }

      updates.push("role_id = ?");
      params.push(roles[0].id);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    params.push(userId);

    // Update user
    await pool.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    // Get updated user
    const [updatedUser] = await pool.execute(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [userId],
    );

    const user = updatedUser[0];
    delete user.password; // Remove password from response

    return user;
  }

  // Reset User Password
  static async resetUserPassword(userId, newPassword) {
    // Check if user exists
    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId],
    );

    if (existingUser.length === 0) {
      throw new Error("User not found");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    return { success: true, message: "Password reset successfully" };
  }

  // Company Creation
  static async createCompany(companyData) {
    const {
      // User data
      name,
      email,
      password,
      phone,
      // Company data
      company_name,
      business_license,
      address,
      description,
      website,
      is_verified = false,
    } = companyData;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if user already exists
      const [existingUsers] = await connection.execute(
        "SELECT id FROM users WHERE email = ?",
        [email],
      );

      if (existingUsers.length > 0) {
        throw new Error("User with this email already exists");
      }

      // Check if company name already exists
      const [existingCompanies] = await connection.execute(
        "SELECT id FROM companies WHERE company_name = ?",
        [company_name],
      );

      if (existingCompanies.length > 0) {
        throw new Error("Company with this name already exists");
      }

      // Get COMPANY role ID
      const [roles] = await connection.execute(
        "SELECT id FROM roles WHERE name = 'COMPANY'",
      );

      if (roles.length === 0) {
        throw new Error("Company role not found");
      }

      const roleId = roles[0].id;

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const [userResult] = await connection.execute(
        `INSERT INTO users (name, email, password, phone, role_id, is_active, email_verified) 
         VALUES (?, ?, ?, ?, ?, true, true)`,
        [name, email, hashedPassword, phone, roleId],
      );

      const userId = userResult.insertId;

      // Create company
      const [companyResult] = await connection.execute(
        `INSERT INTO companies (user_id, company_name, license_number, address, description, website, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          company_name,
          business_license,
          address,
          description,
          website,
          is_verified,
        ],
      );

      // Get created company with user data
      const [newCompany] = await connection.execute(
        `SELECT 
          c.*,
          u.name as owner_name,
          u.email,
          u.phone,
          u.is_active
        FROM companies c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?`,
        [companyResult.insertId],
      );

      await connection.commit();
      return newCompany[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Assign User to Company (NEW)
  static async assignUserToCompany(userId, companyData) {
    const {
      company_name,
      business_license,
      address,
      description,
      website,
      is_verified = false,
    } = companyData;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if user exists
      const [users] = await connection.execute(
        "SELECT id, role_id FROM users WHERE id = ?",
        [userId],
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      // Check if user already has a company
      const [existingCompany] = await connection.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [userId],
      );

      if (existingCompany.length > 0) {
        throw new Error("User already has a company assigned");
      }

      // Check if company name already exists
      const [existingCompanies] = await connection.execute(
        "SELECT id FROM companies WHERE company_name = ?",
        [company_name],
      );

      if (existingCompanies.length > 0) {
        throw new Error("Company with this name already exists");
      }

      // Get COMPANY role ID
      const [roles] = await connection.execute(
        "SELECT id FROM roles WHERE name = 'COMPANY'",
      );

      if (roles.length === 0) {
        throw new Error("Company role not found");
      }

      const companyRoleId = roles[0].id;

      // Update user role to COMPANY
      await connection.execute("UPDATE users SET role_id = ? WHERE id = ?", [
        companyRoleId,
        userId,
      ]);

      // Create company
      const [companyResult] = await connection.execute(
        `INSERT INTO companies (user_id, company_name, license_number, address, description, website, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          company_name,
          business_license,
          address,
          description,
          website,
          is_verified,
        ],
      );

      // Get created company with user data
      const [newCompany] = await connection.execute(
        `SELECT 
          c.*,
          u.name as owner_name,
          u.email,
          u.phone,
          u.is_active
        FROM companies c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?`,
        [companyResult.insertId],
      );

      await connection.commit();
      return newCompany[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get Users Without Company (NEW)
  static async getUsersWithoutCompany() {
    const [users] = await pool.execute(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
        r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN companies c ON u.id = c.user_id
      WHERE c.id IS NULL AND r.name != 'ADMIN'
      ORDER BY u.created_at DESC`,
    );

    return users;
  }

  // Get all companies (for assignment dropdown) (NEW)
  static async getAllCompaniesForAssignment() {
    const [companies] = await pool.execute(
      `SELECT 
        c.id,
        c.company_name,
        c.is_verified,
        u.name as current_owner,
        u.email as current_owner_email,
        u.id as current_owner_id
      FROM companies c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.company_name ASC`,
    );

    return companies;
  }

  // Reassign company to different user (NEW)
  static async reassignCompany(companyId, newUserId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if company exists
      const [companies] = await connection.execute(
        "SELECT id, user_id, company_name FROM companies WHERE id = ?",
        [companyId],
      );

      if (companies.length === 0) {
        throw new Error("Company not found");
      }

      const company = companies[0];
      const oldUserId = company.user_id;

      // Check if new user exists
      const [newUsers] = await connection.execute(
        "SELECT id, role_id FROM users WHERE id = ?",
        [newUserId],
      );

      if (newUsers.length === 0) {
        throw new Error("User not found");
      }

      // Check if new user already has a company
      const [existingCompany] = await connection.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [newUserId],
      );

      if (existingCompany.length > 0) {
        throw new Error("User already has a company assigned");
      }

      // Get COMPANY and USER role IDs
      const [roles] = await connection.execute(
        "SELECT id, name FROM roles WHERE name IN ('COMPANY', 'USER')",
      );

      const companyRoleId = roles.find((r) => r.name === "COMPANY")?.id;
      const userRoleId = roles.find((r) => r.name === "USER")?.id;

      if (!companyRoleId || !userRoleId) {
        throw new Error("Required roles not found");
      }

      // Change old user's role back to USER (if they had a company)
      if (oldUserId) {
        await connection.execute("UPDATE users SET role_id = ? WHERE id = ?", [
          userRoleId,
          oldUserId,
        ]);

        // Notify old owner
        await connection.execute(
          `INSERT INTO notifications (user_id, title, message, type) 
           VALUES (?, ?, ?, ?)`,
          [
            oldUserId,
            "Company Ownership Transferred",
            `The company "${company.company_name}" has been transferred to another user by an administrator.`,
            "info",
          ],
        );
      }

      // Update company with new user
      await connection.execute(
        "UPDATE companies SET user_id = ? WHERE id = ?",
        [newUserId, companyId],
      );

      // Change new user's role to COMPANY
      await connection.execute("UPDATE users SET role_id = ? WHERE id = ?", [
        companyRoleId,
        newUserId,
      ]);

      // Notify new owner
      await connection.execute(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES (?, ?, ?, ?)`,
        [
          newUserId,
          "Company Assigned to You",
          `You have been assigned as the owner of "${company.company_name}". You can now manage this company.`,
          "success",
        ],
      );

      // Get updated company
      const [updatedCompany] = await connection.execute(
        `SELECT 
          c.*,
          u.name as owner_name,
          u.email,
          u.phone,
          u.is_active
        FROM companies c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?`,
        [companyId],
      );

      await connection.commit();
      return updatedCompany[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Create company without user (orphan company) (NEW)
  static async createOrphanCompany(companyData) {
    const {
      company_name,
      business_license,
      address,
      description,
      website,
      is_verified = false,
    } = companyData;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if company name already exists
      const [existingCompanies] = await connection.execute(
        "SELECT id FROM companies WHERE company_name = ?",
        [company_name],
      );

      if (existingCompanies.length > 0) {
        throw new Error("Company with this name already exists");
      }

      // Create company without user_id (will be NULL)
      const [companyResult] = await connection.execute(
        `INSERT INTO companies (user_id, company_name, license_number, address, description, website, is_verified) 
         VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
        [
          company_name,
          business_license,
          address,
          description,
          website,
          is_verified,
        ],
      );

      // Get created company
      const [newCompany] = await connection.execute(
        `SELECT * FROM companies WHERE id = ?`,
        [companyResult.insertId],
      );

      await connection.commit();
      return newCompany[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Company Update
  static async updateCompany(companyId, companyData) {
    const {
      // User data
      name,
      email,
      phone,
      // Company data
      company_name,
      business_license,
      address,
      description,
      website,
    } = companyData;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if company exists
      const [existingCompany] = await connection.execute(
        "SELECT user_id FROM companies WHERE id = ?",
        [companyId],
      );

      if (existingCompany.length === 0) {
        throw new Error("Company not found");
      }

      const userId = existingCompany[0].user_id;

      // Update user data if provided
      const userUpdates = [];
      const userParams = [];

      if (name !== undefined) {
        userUpdates.push("name = ?");
        userParams.push(name);
      }

      if (email !== undefined) {
        // Check if email is already taken by another user
        const [emailCheck] = await connection.execute(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [email, userId],
        );

        if (emailCheck.length > 0) {
          throw new Error("Email is already taken by another user");
        }

        userUpdates.push("email = ?");
        userParams.push(email);
      }

      if (phone !== undefined) {
        userUpdates.push("phone = ?");
        userParams.push(phone);
      }

      if (userUpdates.length > 0) {
        userParams.push(userId);
        await connection.execute(
          `UPDATE users SET ${userUpdates.join(", ")} WHERE id = ?`,
          userParams,
        );
      }

      // Update company data if provided
      const companyUpdates = [];
      const companyParams = [];

      if (company_name !== undefined) {
        // Check if company name is already taken by another company
        const [nameCheck] = await connection.execute(
          "SELECT id FROM companies WHERE company_name = ? AND id != ?",
          [company_name, companyId],
        );

        if (nameCheck.length > 0) {
          throw new Error("Company name is already taken");
        }

        companyUpdates.push("company_name = ?");
        companyParams.push(company_name);
      }

      if (business_license !== undefined) {
        companyUpdates.push("business_license = ?");
        companyParams.push(business_license);
      }

      if (address !== undefined) {
        companyUpdates.push("address = ?");
        companyParams.push(address);
      }

      if (description !== undefined) {
        companyUpdates.push("description = ?");
        companyParams.push(description);
      }

      if (website !== undefined) {
        companyUpdates.push("website = ?");
        companyParams.push(website);
      }

      if (companyUpdates.length > 0) {
        companyParams.push(companyId);
        await connection.execute(
          `UPDATE companies SET ${companyUpdates.join(", ")} WHERE id = ?`,
          companyParams,
        );
      }

      if (userUpdates.length === 0 && companyUpdates.length === 0) {
        throw new Error("No fields to update");
      }

      // Get updated company with user data
      const [updatedCompany] = await connection.execute(
        `SELECT 
          c.*,
          u.name as owner_name,
          u.email,
          u.phone,
          u.is_active
        FROM companies c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?`,
        [companyId],
      );

      await connection.commit();
      return updatedCompany[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Reset Company User Password
  static async resetCompanyPassword(companyId, newPassword) {
    const connection = await pool.getConnection();

    try {
      // Get company user ID
      const [company] = await connection.execute(
        "SELECT user_id FROM companies WHERE id = ?",
        [companyId],
      );

      if (company.length === 0) {
        throw new Error("Company not found");
      }

      const userId = company[0].user_id;

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await connection.execute("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      return { success: true, message: "Company password reset successfully" };
    } finally {
      connection.release();
    }
  }
}
