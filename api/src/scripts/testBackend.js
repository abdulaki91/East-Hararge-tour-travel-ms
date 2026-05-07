import { testConnection } from "../config/database.js";

const testBackend = async () => {
  try {
    console.log("🧪 Testing backend components...");

    // Test database connection
    console.log("📊 Testing database connection...");
    const isConnected = await testConnection();

    if (isConnected) {
      console.log("✅ Database connection successful");
    } else {
      console.log("❌ Database connection failed");
      return;
    }

    console.log("🎉 Backend test completed successfully!");
  } catch (error) {
    console.error("💥 Backend test failed:", error);
  }
};

testBackend();
