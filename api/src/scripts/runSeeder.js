import { seedDatabase } from "../seeders/completeSeedData.js";
import { setupTables } from "../controllers/setupController.js";
import { testConnection } from "../config/database.js";

const runSeeder = async () => {
  try {
    console.log("🚀 Starting database setup...");

    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    // Initialize database schema first
    await setupTables();

    // Then seed with data
    await seedDatabase();

    console.log("🎉 Database setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Database setup failed:", error);
    process.exit(1);
  }
};

runSeeder();
