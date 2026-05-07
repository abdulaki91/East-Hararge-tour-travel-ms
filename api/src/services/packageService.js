import pool from "../config/database.js";

export class PackageService {
  static async createPackage(companyId, packageData) {
    const {
      title,
      description,
      location,
      duration_days,
      price,
      max_people,
      available_slots,
      start_date,
      end_date,
      includes,
      excludes,
      itinerary,
      images,
    } = packageData;

    const [result] = await pool.execute(
      `INSERT INTO packages (
        company_id, title, description, location, duration_days, price,
        max_people, available_slots, start_date, end_date, includes, excludes, itinerary, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        title,
        description,
        location,
        duration_days,
        price,
        max_people,
        available_slots,
        start_date,
        end_date,
        includes,
        excludes,
        itinerary ? JSON.stringify(itinerary) : null,
        images ? JSON.stringify(images) : null,
      ],
    );

    return await this.getPackageById(result.insertId);
  }

  static async getPackages(filters = {}) {
    const {
      page = 1,
      limit = 10,
      location,
      min_price,
      max_price,
      duration,
      sort_by = "created_at",
      sort_order = "desc",
      search,
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ["p.is_active = true"];
    let queryParams = [];

    // Build WHERE conditions
    if (location) {
      whereConditions.push("p.location LIKE ?");
      queryParams.push(`%${location}%`);
    }

    if (min_price) {
      whereConditions.push("p.price >= ?");
      queryParams.push(min_price);
    }

    if (max_price) {
      whereConditions.push("p.price <= ?");
      queryParams.push(max_price);
    }

    if (duration) {
      whereConditions.push("p.duration_days = ?");
      queryParams.push(duration);
    }

    if (search) {
      whereConditions.push(
        "(p.title LIKE ? OR p.description LIKE ? OR p.location LIKE ?)",
      );
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Map frontend sort fields to backend column names
    const sortFieldMap = {
      price: "p.price",
      duration: "p.duration_days",
      duration_days: "p.duration_days",
      created_at: "p.created_at",
      title: "p.title",
      rating: "average_rating",
    };

    const orderBy = sortFieldMap[sort_by] || "p.created_at";

    // Get packages with company info and average rating
    const query = `
      SELECT 
        p.*,
        c.company_name,
        c.logo as company_logo,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM packages p
      JOIN companies c ON p.company_id = c.id
      LEFT JOIN reviews r ON p.id = r.package_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy} ${sort_order.toUpperCase()}, p.id DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    const [packages] = await pool.execute(query, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM packages p
      JOIN companies c ON p.company_id = c.id
      ${whereClause}
    `;

    const [countResult] = await pool.execute(
      countQuery,
      queryParams.slice(0, -2),
    );
    const total = countResult[0].total;

    // Parse JSON fields
    const formattedPackages = packages.map((pkg) => ({
      ...pkg,
      itinerary: pkg.itinerary ? JSON.parse(pkg.itinerary) : null,
      images: pkg.images ? JSON.parse(pkg.images) : [],
      average_rating: parseFloat(pkg.average_rating),
      review_count: parseInt(pkg.review_count),
    }));

    return {
      items: formattedPackages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  static async getPackageById(id) {
    const [packages] = await pool.execute(
      `SELECT 
        p.*,
        c.company_name,
        c.description as company_description,
        c.phone as company_phone,
        c.email as company_email,
        c.website as company_website,
        c.logo as company_logo,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM packages p
      JOIN companies c ON p.company_id = c.id
      LEFT JOIN reviews r ON p.id = r.package_id
      WHERE p.id = ? AND p.is_active = true
      GROUP BY p.id`,
      [id],
    );

    if (packages.length === 0) {
      return null;
    }

    const packageData = packages[0];

    // Get reviews for this package
    const [reviews] = await pool.execute(
      `SELECT 
        r.*,
        u.name as user_name,
        u.profile_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.package_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10`,
      [id],
    );

    return {
      ...packageData,
      itinerary: packageData.itinerary
        ? JSON.parse(packageData.itinerary)
        : null,
      images: packageData.images ? JSON.parse(packageData.images) : [],
      average_rating: parseFloat(packageData.average_rating),
      review_count: parseInt(packageData.review_count),
      reviews,
    };
  }

  static async updatePackage(id, companyId, updateData) {
    const allowedFields = [
      "title",
      "description",
      "location",
      "duration_days",
      "price",
      "max_people",
      "available_slots",
      "start_date",
      "end_date",
      "includes",
      "excludes",
      "itinerary",
      "images",
      "is_active",
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        if (key === "itinerary" && updateData[key]) {
          // Check if it's already a string (from FormData) or needs stringifying
          const itineraryValue =
            typeof updateData[key] === "string"
              ? updateData[key]
              : JSON.stringify(updateData[key]);
          updateValues.push(itineraryValue);
        } else if (key === "images" && updateData[key]) {
          // Check if it's already a string (from FormData) or needs stringifying
          const imagesValue =
            typeof updateData[key] === "string"
              ? updateData[key]
              : JSON.stringify(updateData[key]);
          updateValues.push(imagesValue);
        } else {
          updateValues.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    updateValues.push(id, companyId);

    const [result] = await pool.execute(
      `UPDATE packages SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND company_id = ?`,
      updateValues,
    );

    if (result.affectedRows === 0) {
      throw new Error("Package not found or unauthorized");
    }

    // Fetch the updated package without the is_active filter for company's own packages
    const [packages] = await pool.execute(
      `SELECT 
        p.*,
        c.company_name,
        c.description as company_description,
        c.phone as company_phone,
        c.email as company_email,
        c.website as company_website,
        c.logo as company_logo,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM packages p
      JOIN companies c ON p.company_id = c.id
      LEFT JOIN reviews r ON p.id = r.package_id
      WHERE p.id = ?
      GROUP BY p.id`,
      [id],
    );

    if (packages.length === 0) {
      return null;
    }

    const packageData = packages[0];

    return {
      ...packageData,
      itinerary: packageData.itinerary
        ? JSON.parse(packageData.itinerary)
        : null,
      images: packageData.images ? JSON.parse(packageData.images) : [],
      average_rating: parseFloat(packageData.average_rating),
      review_count: parseInt(packageData.review_count),
    };
  }

  static async deletePackage(id, companyId) {
    const [result] = await pool.execute(
      "UPDATE packages SET is_active = false WHERE id = ? AND company_id = ?",
      [id, companyId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Package not found or unauthorized");
    }

    return true;
  }

  static async getCompanyPackages(companyId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;
    const offset = (page - 1) * limit;

    const [packages] = await pool.execute(
      `SELECT 
        p.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count,
        COUNT(DISTINCT b.id) as booking_count,
        COUNT(DISTINCT CASE WHEN b.status IN ('pending', 'confirmed') THEN b.id END) as active_booking_count,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_booking_count
      FROM packages p
      LEFT JOIN reviews r ON p.id = r.package_id
      LEFT JOIN bookings b ON p.id = b.package_id
      WHERE p.company_id = ?
      GROUP BY p.id
      ORDER BY p.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?`,
      [companyId, limit, offset],
    );

    // Get total count
    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM packages WHERE company_id = ?",
      [companyId],
    );

    const total = countResult[0].total;

    const formattedPackages = packages.map((pkg) => {
      // Determine package status
      let packageStatus = "active";
      const now = new Date();
      const endDate = new Date(pkg.end_date);

      // Package is completed if:
      // 1. End date has passed AND has bookings, OR
      // 2. Has bookings and all are completed (no active bookings)
      if (pkg.booking_count > 0) {
        if (endDate < now || pkg.active_booking_count === 0) {
          packageStatus = "completed";
        }
      }

      return {
        ...pkg,
        itinerary: pkg.itinerary ? JSON.parse(pkg.itinerary) : null,
        images: pkg.images ? JSON.parse(pkg.images) : [],
        average_rating: parseFloat(pkg.average_rating),
        review_count: parseInt(pkg.review_count),
        booking_count: parseInt(pkg.booking_count),
        active_booking_count: parseInt(pkg.active_booking_count),
        completed_booking_count: parseInt(pkg.completed_booking_count),
        package_status: packageStatus,
      };
    });

    return {
      items: formattedPackages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
}
