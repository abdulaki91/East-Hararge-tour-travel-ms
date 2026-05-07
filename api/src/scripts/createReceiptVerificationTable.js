import pool from "../config/database.js";

async function createReceiptVerificationTable() {
  const connection = await pool.getConnection();

  try {
    console.log("🔄 Creating receipt verification table...");

    // Create receipt_verifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS receipt_verifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        payment_id INT NOT NULL,
        action_type ENUM('qr_generated', 'verified', 'verification_failed') NOT NULL,
        performed_by INT NOT NULL,
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
        FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_booking_payment (booking_id, payment_id),
        INDEX idx_action_type (action_type),
        INDEX idx_performed_by (performed_by),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log("✅ Receipt verification table created successfully");
  } catch (error) {
    console.error("❌ Failed to create receipt verification table:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run the script
createReceiptVerificationTable()
  .then(() => {
    console.log("✅ Receipt verification table setup completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Receipt verification table setup failed:", error);
    process.exit(1);
  });
