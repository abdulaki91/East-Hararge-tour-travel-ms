import { NotificationService } from "../services/notificationService.js";

export class NotificationController {
  static async getMyNotifications(req, res) {
    try {
      const userId = req.user.id;
      const result = await NotificationService.getUserNotifications(
        userId,
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

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await NotificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const updatedCount = await NotificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: `${updatedCount} notifications marked as read`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await NotificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await NotificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { unread_count: count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async bulkMarkAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notification_ids } = req.body;

      if (!notification_ids || !Array.isArray(notification_ids)) {
        return res.status(400).json({
          success: false,
          message: "notification_ids array is required",
        });
      }

      const updatedCount = await NotificationService.bulkMarkAsRead(
        userId,
        notification_ids,
      );

      res.status(200).json({
        success: true,
        message: `${updatedCount} notifications marked as read`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
