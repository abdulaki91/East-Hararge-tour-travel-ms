import pool from "../config/database.js";

async function migrateOrphanCompanies() {
  const connection = await pool.getConnection();

  try {
    console.log("Starting migration to allow orphan companies...");

    // Alter the companies table to allow NULL user_id
    await connection.execute(`
      ALTER TABLE companies 
      MODIFY COLUMN user_id INT UNIQUE NULL
    `);

    console.log("✅ Migration completed successfully!");
    console.log("   - user_id column now allows NULL values");
    console.log("   - Orphan companies can now be created");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run migration
migrateOrphanCompanies()
  .then(() => {
    console.log("\n✨ Database migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration error:", error);
    process.exit(1);
  });
