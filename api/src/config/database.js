import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tour_travel_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Remove invalid options that cause warnings
  multipleStatements: true, // Allow multiple statements
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    // First test connection without database
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;

    const tempPool = mysql.createPool(tempConfig);
    const connection = await tempPool.getConnection();
    console.log("✅ Database server connected successfully");

    // Create database if not exists
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`,
    );
    console.log(`✅ Database '${dbConfig.database}' ready`);

    connection.release();
    await tempPool.end();

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

export default pool;
