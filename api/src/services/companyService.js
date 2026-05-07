import pool from "../config/database.js";

export class CompanyService {
  // Register company for current user
  static async registerCompany(userId, companyData) {
    const {
      company_name,
      business_license,
      address,
      description,
      website,
      phone,
      email,
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
        throw new Error("You already have a company registered");
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

      // Create company (is_verified = false by default)
      const [companyResult] = await connection.execute(
        `INSERT INTO companies (user_id, company_name, license_number, address, description, website, phone, email, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, false)`,
        [
          userId,
          company_name,
          business_license,
          address,
          description,
          website,
          phone,
          email,
        ],
      );

      // Get created company with user data
      const [newCompany] = await connection.execute(
        `SELECT 
          c.*,
          u.name as owner_name,
          u.email as user_email,
          u.phone as user_phone,
          u.is_active
        FROM companies c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?`,
        [companyResult.insertId],
      );

      await connection.commit();

      // Notify admins about new company registration (async, don't wait)
      const { NotificationService } = await import("./notificationService.js");
      NotificationService.notifyAdminsNewCompanyRegistration({
        company_name,
        owner_name: newCompany[0].owner_name,
        owner_email: newCompany[0].user_email,
      }).catch((error) => console.error("Failed to notify admins:", error));

      return newCompany[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get company by user ID
  static async getCompanyByUserId(userId) {
    const [companies] = await pool.execute(
      `SELECT 
        c.*,
        u.name as owner_name,
        u.email as user_email,
        u.phone as user_phone,
        u.is_active
      FROM companies c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?`,
      [userId],
    );

    if (companies.length === 0) {
      return null;
    }

    return companies[0];
  }

  // Update company profile
  static async updateCompany(userId, companyData) {
    const {
      company_name,
      business_license,
      address,
      description,
      website,
      phone,
      email,
    } = companyData;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get company
      const [companies] = await connection.execute(
        "SELECT id, company_name FROM companies WHERE user_id = ?",
        [userId],
      );

      if (companies.length === 0) {
        throw new Error("Company not found");
      }

      const company = companies[0];

      // Check if new company name already exists (if changing name)
      if (company_name && company_name !== company.company_name) {
        const [existingCompanies] = await connection.execute(
          "SELECT id FROM companies WHERE company_name = ? AND user_id != ?",
          [company_name, userId],
        );

        if (existingCompanies.length > 0) {
          throw new Error("Company with this name already exists");
        }
      }

      // Build update query dynamically
      const updates = [];
      const params = [];

      if (company_name !== undefined) {
        updates.push("company_name = ?");
        params.push(company_name);
      }

      if (business_license !== undefined) {
        updates.push("license_number = ?");
        params.push(business_license);
      }

      if (address !== undefined) {
        updates.push("address = ?");
        params.push(address);
      }

      if (description !== undefined) {
        updates.push("description = ?");
        params.push(description);
      }

      if (website !== undefined) {
        updates.push("website = ?");
        params.push(website);
      }

      if (phone !== undefined) {
        updates.push("phone = ?");
        params.push(phone);
      }

      if (email !== undefined) {
        updates.push("email = ?");
        params.push(email);
      }

      if (updates.length === 0) {
        throw new Error("No fields to update");
      }

      params.push(userId);

      // Update company
      await connection.execute(
        `UPDATE companies SET ${updates.join(", ")} WHERE user_id = ?`,
        params,
      );

      // Get updated company
      const [updatedCompany] = await connection.execute(
        `SELECT 
          c.*,
          u.name as owner_name,
          u.email as user_email,
          u.phone as user_phone,
          u.is_active
        FROM companies c
        JOIN users u ON c.user_id = u.id
        WHERE c.user_id = ?`,
        [userId],
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

  // Get company statistics
  static async getCompanyStats(userId) {
    // Get company
    const [companies] = await pool.execute(
      "SELECT id FROM companies WHERE user_id = ?",
      [userId],
    );

    if (companies.length === 0) {
      throw new Error("Company not found");
    }

    const companyId = companies[0].id;

    // Get total packages
    const [packageStats] = await pool.execute(
      "SELECT COUNT(*) as total_packages FROM packages WHERE company_id = ?",
      [userId],
    );

    // Get active packages
    const [activePackages] = await pool.execute(
      "SELECT COUNT(*) as active_packages FROM packages WHERE company_id = ? AND is_active = true",
      [userId],
    );

    // Get total bookings
    const [bookingStats] = await pool.execute(
      `SELECT COUNT(*) as total_bookings 
       FROM bookings b
       JOIN packages p ON b.package_id = p.id
       WHERE p.company_id = ?`,
      [userId],
    );

    // Get total revenue
    const [revenueStats] = await pool.execute(
      `SELECT COALESCE(SUM(pay.amount), 0) as total_revenue 
       FROM payments pay
       JOIN bookings b ON pay.booking_id = b.id
       JOIN packages p ON b.package_id = p.id
       WHERE p.company_id = ? AND pay.status = 'completed'`,
      [userId],
    );

    return {
      total_packages: packageStats[0].total_packages,
      active_packages: activePackages[0].active_packages,
      total_bookings: bookingStats[0].total_bookings,
      total_revenue: parseFloat(revenueStats[0].total_revenue),
    };
  }
}
