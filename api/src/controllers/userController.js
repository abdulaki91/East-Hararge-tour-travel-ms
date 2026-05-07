import { UserService } from "../services/userService.js";

export class UserController {
  static async getProfile(req, res) {
    try {
      const profile = await UserService.getUserProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const profile = await UserService.updateProfile(req.user.id, req.body);

      res.status(200).json({
        success: true,
        data: profile,
        message: "Profile updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const result = await UserService.changePassword(req.user.id, req.body);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateCompanyProfile(req, res) {
    try {
      const profile = await UserService.updateCompanyProfile(
        req.user.id,
        req.body,
      );

      res.status(200).json({
        success: true,
        data: profile,
        message: "Company profile updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats(req.user.id);

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

  static async getNotificationPreferences(req, res) {
    try {
      const preferences = await UserService.getUserNotificationPreferences(
        req.user.id,
      );

      res.status(200).json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateNotificationPreferences(req, res) {
    try {
      const preferences = await UserService.updateNotificationPreferences(
        req.user.id,
        req.body,
      );

      res.status(200).json({
        success: true,
        data: preferences,
        message: "Notification preferences updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      const result = await UserService.deleteAccount(req.user.id, password);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
