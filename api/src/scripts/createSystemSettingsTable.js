import pool from "../config/database.js";

async function createSystemSettingsTable() {
  const connection = await pool.getConnection();

  try {
    console.log("🔧 Creating system_settings table...");

    // Create system_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        description TEXT,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_setting_key (setting_key),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ system_settings table created successfully");

    // Insert default settings
    console.log("🔧 Inserting default settings...");

    const defaultSettings = [
      // General Settings
      [
        "site_name",
        "East Hararghe Tours",
        "string",
        "Name of the travel booking platform",
        "general",
      ],
      [
        "site_description",
        "Discover the beauty of East Hararghe with our curated travel packages",
        "string",
        "Brief description of the platform",
        "general",
      ],
      [
        "contact_email",
        "info@easthararghetours.com",
        "string",
        "Primary contact email",
        "general",
      ],
      [
        "contact_phone",
        "+251-911-123456",
        "string",
        "Primary contact phone number",
        "general",
      ],

      // System Settings
      [
        "maintenance_mode",
        "false",
        "boolean",
        "Enable maintenance mode",
        "system",
      ],
      [
        "registration_enabled",
        "true",
        "boolean",
        "Allow new user registrations",
        "system",
      ],
      [
        "booking_enabled",
        "true",
        "boolean",
        "Allow users to create bookings",
        "system",
      ],
      [
        "payment_enabled",
        "true",
        "boolean",
        "Enable payment processing",
        "system",
      ],

      // Notification Settings
      [
        "email_notifications",
        "true",
        "boolean",
        "Enable email notifications",
        "notifications",
      ],
      [
        "sms_notifications",
        "false",
        "boolean",
        "Enable SMS notifications",
        "notifications",
      ],
      [
        "push_notifications",
        "true",
        "boolean",
        "Enable push notifications",
        "notifications",
      ],

      // Content Settings
      [
        "max_upload_size",
        "10",
        "number",
        "Maximum file upload size in MB",
        "content",
      ],
      [
        "allowed_file_types",
        '["jpg","jpeg","png","gif","pdf"]',
        "json",
        "Allowed file types for uploads",
        "content",
      ],
      [
        "max_images_per_package",
        "10",
        "number",
        "Maximum images per package",
        "content",
      ],

      // Booking Settings
      [
        "min_booking_advance_days",
        "3",
        "number",
        "Minimum days in advance for booking",
        "booking",
      ],
      [
        "max_booking_advance_days",
        "365",
        "number",
        "Maximum days in advance for booking",
        "booking",
      ],
      [
        "cancellation_deadline_hours",
        "48",
        "number",
        "Hours before trip for free cancellation",
        "booking",
      ],
      [
        "auto_confirm_bookings",
        "false",
        "boolean",
        "Automatically confirm bookings",
        "booking",
      ],

      // Payment Settings
      ["currency", "ETB", "string", "Default currency code", "payment"],
      [
        "payment_gateway",
        "chapa",
        "string",
        "Active payment gateway",
        "payment",
      ],
      [
        "commission_rate",
        "10",
        "number",
        "Platform commission rate (%)",
        "payment",
      ],
      [
        "refund_processing_days",
        "7",
        "number",
        "Days to process refunds",
        "payment",
      ],

      // Security Settings
      [
        "session_timeout_minutes",
        "60",
        "number",
        "Session timeout in minutes",
        "security",
      ],
      [
        "max_login_attempts",
        "5",
        "number",
        "Maximum failed login attempts",
        "security",
      ],
      [
        "password_min_length",
        "8",
        "number",
        "Minimum password length",
        "security",
      ],
      [
        "require_email_verification",
        "false",
        "boolean",
        "Require email verification for new users",
        "security",
      ],
    ];

    for (const setting of defaultSettings) {
      await connection.execute(
        `INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value),
         description = VALUES(description)`,
        setting,
      );
    }

    console.log("✅ Default settings inserted successfully");
    console.log("✅ System settings table setup complete!");
  } catch (error) {
    console.error("❌ Error creating system_settings table:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run the migration
createSystemSettingsTable()
  .then(() => {
    console.log("✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
