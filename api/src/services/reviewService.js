import pool from "../config/database.js";

export class ReviewService {
  static async createReview(userId, reviewData) {
    const { package_id, booking_id, rating, comment } = reviewData;

    // Check if booking exists and belongs to user
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND status = "completed"',
      [booking_id, userId],
    );

    if (bookings.length === 0) {
      throw new Error("Booking not found or not completed");
    }

    // Check if review already exists
    const [existingReviews] = await pool.execute(
      "SELECT id FROM reviews WHERE user_id = ? AND booking_id = ?",
      [userId, booking_id],
    );

    if (existingReviews.length > 0) {
      throw new Error("Review already exists for this booking");
    }

    // Create review
    const [result] = await pool.execute(
      `INSERT INTO reviews (user_id, package_id, booking_id, rating, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, package_id, booking_id, rating, comment],
    );

    return await this.getReviewById(result.insertId);
  }

  static async getReviewById(id) {
    const [reviews] = await pool.execute(
      `SELECT 
        r.*,
        u.name as user_name,
        u.name as first_name,
        '' as last_name,
        u.profile_image,
        p.title as package_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      WHERE r.id = ?`,
      [id],
    );

    return reviews.length > 0 ? reviews[0] : null;
  }

  static async getPackageReviews(packageId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;
    const offset = (page - 1) * limit;

    const [reviews] = await pool.execute(
      `SELECT 
        r.*,
        u.name as user_name,
        u.name as first_name,
        '' as last_name,
        u.profile_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.package_id = ?
      ORDER BY r.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?`,
      [packageId, limit, offset],
    );

    // Get total count
    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM reviews WHERE package_id = ?",
      [packageId],
    );

    const total = countResult[0].total;

    return {
      reviews,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  static async updateReview(id, userId, updateData) {
    const { rating, comment } = updateData;

    const [result] = await pool.execute(
      "UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [rating, comment, id, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Review not found or unauthorized");
    }

    return await this.getReviewById(id);
  }

  static async deleteReview(id, userId) {
    const [result] = await pool.execute(
      "DELETE FROM reviews WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Review not found or unauthorized");
    }

    return true;
  }

  static async getUserReviews(userId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      sort_order = "desc",
      rating,
    } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ["r.user_id = ?"];
    let queryParams = [userId];

    if (rating) {
      whereConditions.push("r.rating = ?");
      queryParams.push(parseInt(rating));
    }

    const whereClause = whereConditions.join(" AND ");

    const [reviews] = await pool.execute(
      `SELECT 
        r.*,
        p.title as package_title,
        p.location as package_location
      FROM reviews r
      JOIN packages p ON r.package_id = p.id
      WHERE ${whereClause}
      ORDER BY r.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM reviews r WHERE ${whereClause}`,
      queryParams,
    );

    const total = countResult[0].total;

    return {
      items: reviews,
      pagination: {
        page: parseInt(page),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCompanyReviews(companyId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      sort_order = "desc",
      rating = "",
    } = filters;
    const offset = (page - 1) * limit;

    // First, get the actual company_id from the companies table using user_id
    const [companies] = await pool.execute(
      "SELECT id FROM companies WHERE user_id = ?",
      [companyId],
    );

    if (companies.length === 0) {
      return {
        reviews: [],
        pagination: {
          current_page: parseInt(page),
          total_pages: 0,
          total_items: 0,
          items_per_page: parseInt(limit),
        },
        stats: {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: [],
        },
      };
    }

    const actualCompanyId = companies[0].id;

    let whereConditions = ["p.company_id = ?"];
    let queryParams = [actualCompanyId];

    if (rating) {
      whereConditions.push("r.rating = ?");
      queryParams.push(parseInt(rating));
    }

    const whereClause = whereConditions.join(" AND ");

    const [reviews] = await pool.execute(
      `SELECT 
        r.*,
        u.name as user_name,
        u.profile_image,
        p.title as package_title,
        p.location as package_location,
        p.id as package_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN packages p ON r.package_id = p.id
      WHERE ${whereClause}
      ORDER BY r.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total
      FROM reviews r
      JOIN packages p ON r.package_id = p.id
      WHERE ${whereClause}`,
      queryParams,
    );

    const total = countResult[0].total;

    // Get rating distribution
    const [ratingStats] = await pool.execute(
      `SELECT 
        r.rating,
        COUNT(*) as count
      FROM reviews r
      JOIN packages p ON r.package_id = p.id
      WHERE p.company_id = ?
      GROUP BY r.rating
      ORDER BY r.rating DESC`,
      [actualCompanyId],
    );

    // Get average rating
    const [avgRating] = await pool.execute(
      `SELECT 
        AVG(r.rating) as average_rating,
        COUNT(r.id) as total_reviews
      FROM reviews r
      JOIN packages p ON r.package_id = p.id
      WHERE p.company_id = ?`,
      [actualCompanyId],
    );

    return {
      reviews,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: parseInt(limit),
      },
      stats: {
        average_rating: parseFloat(avgRating[0].average_rating || 0),
        total_reviews: parseInt(avgRating[0].total_reviews || 0),
        rating_distribution: ratingStats.map((stat) => ({
          rating: parseInt(stat.rating),
          count: parseInt(stat.count),
        })),
      },
    };
  }
}
