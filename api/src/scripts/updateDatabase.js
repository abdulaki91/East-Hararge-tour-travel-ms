import pool from "../config/database.js";

async function updateDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("🔄 Updating database schema...");

    // Add new columns to payments table
    try {
      await connection.execute(`
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS fees DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS payment_url TEXT,
        ADD COLUMN IF NOT EXISTS gateway_response JSON,
        ADD COLUMN IF NOT EXISTS gateway_verification_data JSON,
        ADD COLUMN IF NOT EXISTS verified_amount DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS failure_reason TEXT
      `);
      console.log("✅ Updated payments table");
    } catch (error) {
      console.log("ℹ️ Payments table already updated or error:", error.message);
    }

    // Create payment_refunds table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS payment_refunds (
          id INT PRIMARY KEY AUTO_INCREMENT,
          payment_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          reason TEXT,
          status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
          gateway_refund_id VARCHAR(255),
          gateway_response JSON,
          requested_by VARCHAR(50) DEFAULT 'system',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
        )
      `);
      console.log("✅ Created payment_refunds table");
    } catch (error) {
      console.log(
        "ℹ️ payment_refunds table already exists or error:",
        error.message,
      );
    }

    // Create user_notification_preferences table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS user_notification_preferences (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL UNIQUE,
          email_notifications BOOLEAN DEFAULT true,
          sms_notifications BOOLEAN DEFAULT true,
          push_notifications BOOLEAN DEFAULT true,
          booking_updates BOOLEAN DEFAULT true,
          payment_updates BOOLEAN DEFAULT true,
          promotional_offers BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log("✅ Created user_notification_preferences table");
    } catch (error) {
      console.log(
        "ℹ️ user_notification_preferences table already exists or error:",
        error.message,
      );
    }

    // Update companies table with additional fields
    try {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
        ADD COLUMN IF NOT EXISTS website VARCHAR(255),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log("✅ Updated companies table");
    } catch (error) {
      console.log(
        "ℹ️ Companies table already updated or error:",
        error.message,
      );
    }

    // Add indexes for better performance
    try {
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id)
      `);
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)
      `);
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)
      `);
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role_id, is_active)
      `);
      console.log("✅ Added database indexes");
    } catch (error) {
      console.log("ℹ️ Indexes already exist or error:", error.message);
    }

    console.log("🎉 Database update completed successfully!");
  } catch (error) {
    console.error("❌ Database update failed:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run the update
updateDatabase()
  .then(() => {
    console.log("✅ Database update script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database update script failed:", error);
    process.exit(1);
  });
