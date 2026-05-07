import pool from "../config/database.js";
import { emitNotificationToUser } from "../socket/index.js";

/**
 * Test script to create notifications and verify the notification system
 *
 * Usage:
 * 1. Make sure the backend server is running
 * 2. Run: node src/scripts/testNotifications.js <user_id>
 * 3. Check the frontend to see if the notification badge appears
 */

async function createTestNotification(userId) {
  try {
    console.log(`\n📝 Creating test notification for user ${userId}...`);

    // Insert a test notification into the database
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        "🎉 Test Notification",
        "This is a test notification to verify the notification system is working correctly.",
        "system",
        false, // unread
      ],
    );

    const notificationId = result.insertId;
    console.log(`✅ Test notification created with ID: ${notificationId}`);

    // Get the notification details
    const [notifications] = await pool.execute(
      "SELECT * FROM notifications WHERE id = ?",
      [notificationId],
    );

    const notification = notifications[0];

    // Try to emit via socket (if socket is initialized)
    try {
      emitNotificationToUser(userId, notification);
      console.log(`📤 Notification emitted via socket to user ${userId}`);
    } catch (error) {
      console.log(
        `⚠️  Socket not initialized. Notification saved to database but not emitted in real-time.`,
      );
      console.log(`   User will see it when they refresh or reconnect.`);
    }

    // Get unread count
    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
      [userId],
    );

    console.log(
      `\n📊 Unread notification count for user ${userId}: ${countResult[0].count}`,
    );
    console.log(`\n✅ Test completed! Check the frontend notification bell.`);
    console.log(
      `   Expected: Badge showing ${countResult[0].count} unread notification(s)\n`,
    );

    return notification;
  } catch (error) {
    console.error("❌ Error creating test notification:", error);
    throw error;
  }
}

async function listUserNotifications(userId) {
  try {
    console.log(`\n📋 Listing all notifications for user ${userId}...\n`);

    const [notifications] = await pool.execute(
      `SELECT id, title, message, type, is_read, created_at 
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId],
    );

    if (notifications.length === 0) {
      console.log(`   No notifications found for user ${userId}`);
    } else {
      notifications.forEach((notif, index) => {
        const status = notif.is_read ? "✓ Read" : "● Unread";
        console.log(`${index + 1}. [${status}] ${notif.title}`);
        console.log(`   Type: ${notif.type} | Created: ${notif.created_at}`);
        console.log(`   Message: ${notif.message}\n`);
      });
    }

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
      [userId],
    );

    console.log(`📊 Total unread: ${countResult[0].count}`);
    console.log(`📊 Total notifications: ${notifications.length}\n`);
  } catch (error) {
    console.error("❌ Error listing notifications:", error);
    throw error;
  }
}

async function markAllAsRead(userId) {
  try {
    console.log(`\n📖 Marking all notifications as read for user ${userId}...`);

    const [result] = await pool.execute(
      "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false",
      [userId],
    );

    console.log(`✅ Marked ${result.affectedRows} notification(s) as read\n`);
  } catch (error) {
    console.error("❌ Error marking notifications as read:", error);
    throw error;
  }
}

async function deleteAllNotifications(userId) {
  try {
    console.log(`\n🗑️  Deleting all notifications for user ${userId}...`);

    const [result] = await pool.execute(
      "DELETE FROM notifications WHERE user_id = ?",
      [userId],
    );

    console.log(`✅ Deleted ${result.affectedRows} notification(s)\n`);
  } catch (error) {
    console.error("❌ Error deleting notifications:", error);
    throw error;
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];
const userId = args[1];

if (!command || !userId) {
  console.log(`
📝 Notification Test Script

Usage:
  node src/scripts/testNotifications.js <command> <user_id>

Commands:
  create <user_id>    - Create a test notification
  list <user_id>      - List all notifications for user
  read <user_id>      - Mark all notifications as read
  delete <user_id>    - Delete all notifications for user

Examples:
  node src/scripts/testNotifications.js create 1
  node src/scripts/testNotifications.js list 1
  node src/scripts/testNotifications.js read 1
  node src/scripts/testNotifications.js delete 1
  `);
  process.exit(1);
}

(async () => {
  try {
    switch (command) {
      case "create":
        await createTestNotification(userId);
        break;
      case "list":
        await listUserNotifications(userId);
        break;
      case "read":
        await markAllAsRead(userId);
        break;
      case "delete":
        await deleteAllNotifications(userId);
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log(`   Valid commands: create, list, read, delete`);
        process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
})();
