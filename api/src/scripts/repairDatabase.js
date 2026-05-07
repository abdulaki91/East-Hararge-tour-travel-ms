import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tour_travel_db",
  port: process.env.DB_PORT || 3306,
};

/**
 * Repair Database Script
 * Fixes corrupted tablespace issues by dropping all tables individually
 */
const repairDatabase = async () => {
  let connection;
  let pool;
  try {
    console.log("🔧 Starting database repair...");

    // Connect to the database
    pool = mysql.createPool(dbConfig);
    connection = await pool.getConnection();

    console.log(`⚠️  Dropping all tables in '${dbConfig.database}'...`);

    // Disable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // Get all tables
    const [tables] = await connection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
      [dbConfig.database],
    );

    // Drop each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME || table.table_name;
      console.log(`  Dropping table: ${tableName}`);
      await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    }

    // Re-enable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ All tables dropped successfully!");
    console.log("ℹ️  Please restart your server to initialize fresh tables.");

    connection.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database repair failed:", error.message);
    if (connection) {
      connection.release();
    }
    if (pool) {
      await pool.end();
    }
    process.exit(1);
  }
};

repairDatabase();
