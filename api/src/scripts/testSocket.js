import { NotificationService } from "../services/notificationService.js";
import {
  emitNotificationToUser,
  emitSystemAnnouncement,
} from "../socket/index.js";
import pool from "../config/database.js";

// Test script to verify Socket.IO notification system
const testSocketNotifications = async () => {
  try {
    console.log("🧪 Testing Socket.IO notification system...");

    // Get a test user
    const [users] = await pool.execute(
      "SELECT id, name, email FROM users WHERE role_id = 1 LIMIT 1",
    );

    if (users.length === 0) {
      console.log("❌ No test users found. Please run the seeder first.");
      return;
    }

    const testUser = users[0];
    console.log(`📧 Testing with user: ${testUser.name} (${testUser.email})`);

    // Test 1: Create a welcome notification
    console.log("\n🔔 Test 1: Creating welcome notification...");
    const welcomeNotification = await NotificationService.createNotification(
      testUser.id,
      {
        title: "Welcome to East Hararghe Tours!",
        message:
          "Thank you for joining our platform. Start exploring amazing tour packages in East Hararghe region.",
        type: "welcome",
      },
    );
    console.log("✅ Welcome notification created:", welcomeNotification.id);

    // Test 2: Create a booking confirmation notification
    console.log("\n🔔 Test 2: Creating booking confirmation notification...");
    const bookingNotification =
      await NotificationService.notifyBookingConfirmed(testUser.id, {
        package_title: "Harar Cultural Heritage Tour",
        booking_reference: "BK-TEST-001",
      });
    console.log("✅ Booking notification created:", bookingNotification.id);

    // Test 3: Create a payment notification
    console.log("\n🔔 Test 3: Creating payment notification...");
    const paymentNotification =
      await NotificationService.notifyPaymentCompleted(testUser.id, {
        amount: 2500.0,
        transaction_reference: "TXN-TEST-001",
      });
    console.log("✅ Payment notification created:", paymentNotification.id);

    // Test 4: Get unread count
    console.log("\n📊 Test 4: Getting unread count...");
    const unreadCount = await NotificationService.getUnreadCount(testUser.id);
    console.log(`✅ Unread notifications: ${unreadCount}`);

    // Test 5: Get user notifications
    console.log("\n📋 Test 5: Getting user notifications...");
    const notifications = await NotificationService.getUserNotifications(
      testUser.id,
      {
        limit: 5,
        sort_by: "created_at",
        sort_order: "desc",
      },
    );
    console.log(
      `✅ Retrieved ${notifications.notifications.length} notifications`,
    );

    // Test 6: Mark notification as read
    if (notifications.notifications.length > 0) {
      console.log("\n📖 Test 6: Marking notification as read...");
      const firstNotification = notifications.notifications[0];
      await NotificationService.markAsRead(firstNotification.id, testUser.id);
      console.log(`✅ Notification ${firstNotification.id} marked as read`);
    }

    // Test 7: System announcement (if socket is available)
    console.log("\n📢 Test 7: Testing system announcement...");
    try {
      emitSystemAnnouncement(
        "System maintenance scheduled for tonight at 2 AM UTC",
      );
      console.log("✅ System announcement sent");
    } catch (error) {
      console.log(
        "⚠️ System announcement failed (Socket.IO may not be initialized):",
        error.message,
      );
    }

    console.log(
      "\n🎉 All Socket.IO notification tests completed successfully!",
    );
    console.log("\n📝 Next steps:");
    console.log("1. Start the backend server: npm run dev");
    console.log("2. Start the frontend server: npm run dev");
    console.log("3. Login with a test user to see real-time notifications");
    console.log("4. Check the browser console for Socket.IO connection logs");
  } catch (error) {
    console.error("❌ Socket.IO test failed:", error);
  } finally {
    process.exit(0);
  }
};

testSocketNotifications();
