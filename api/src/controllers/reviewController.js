import { ReviewService } from "../services/reviewService.js";

export class ReviewController {
  static async createReview(req, res) {
    try {
      const userId = req.user.id;
      const review = await ReviewService.createReview(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getPackageReviews(req, res) {
    try {
      const { packageId } = req.params;
      const result = await ReviewService.getPackageReviews(
        packageId,
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

  static async getMyReviews(req, res) {
    try {
      const userId = req.user.id;
      const result = await ReviewService.getUserReviews(userId, req.query);

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

  static async updateReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const review = await ReviewService.updateReview(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await ReviewService.deleteReview(id, userId);

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getCompanyReviews(req, res) {
    try {
      // Use user_id directly (the user_id is the company owner's user ID)
      const userId = req.user.id;
      const result = await ReviewService.getCompanyReviews(userId, req.query);

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
}
