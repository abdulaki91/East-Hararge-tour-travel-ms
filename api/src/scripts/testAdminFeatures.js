/**
 * Test script for new admin features
 * This script demonstrates the new edit, delete, and reset password features
 *
 * Usage: node src/scripts/testAdminFeatures.js
 */

import axios from "axios";

const API_BASE_URL = process.env.API_URL || "http://localhost:5000/api";

// You need to replace this with a valid admin token
const ADMIN_TOKEN = "YOUR_ADMIN_TOKEN_HERE";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json",
  },
});

async function testUpdateUser() {
  console.log("\n=== Testing Update User ===");
  try {
    const response = await api.put("/admin/users/1", {
      name: "Updated User Name",
      phone: "+251911999999",
    });
    console.log("✅ Update User Success:", response.data);
  } catch (error) {
    console.error(
      "❌ Update User Failed:",
      error.response?.data || error.message,
    );
  }
}

async function testResetUserPassword() {
  console.log("\n=== Testing Reset User Password ===");
  try {
    const response = await api.post("/admin/users/1/reset-password", {
      password: "newPassword123",
    });
    console.log("✅ Reset User Password Success:", response.data);
  } catch (error) {
    console.error(
      "❌ Reset User Password Failed:",
      error.response?.data || error.message,
    );
  }
}

async function testUpdateCompany() {
  console.log("\n=== Testing Update Company ===");
  try {
    const response = await api.put("/admin/companies/1", {
      company_name: "Updated Company Name",
      description: "Updated company description",
      website: "https://updated-website.com",
    });
    console.log("✅ Update Company Success:", response.data);
  } catch (error) {
    console.error(
      "❌ Update Company Failed:",
      error.response?.data || error.message,
    );
  }
}

async function testResetCompanyPassword() {
  console.log("\n=== Testing Reset Company Password ===");
  try {
    const response = await api.post("/admin/companies/1/reset-password", {
      password: "newCompanyPassword123",
    });
    console.log("✅ Reset Company Password Success:", response.data);
  } catch (error) {
    console.error(
      "❌ Reset Company Password Failed:",
      error.response?.data || error.message,
    );
  }
}

async function testGetUsers() {
  console.log("\n=== Testing Get All Users ===");
  try {
    const response = await api.get("/admin/users", {
      params: {
        page: 1,
        limit: 5,
      },
    });
    console.log("✅ Get Users Success:");
    console.log(`   Total Users: ${response.data.data.total}`);
    console.log(
      `   Page: ${response.data.data.page}/${response.data.data.totalPages}`,
    );
    console.log(`   Users on this page: ${response.data.data.items.length}`);
  } catch (error) {
    console.error(
      "❌ Get Users Failed:",
      error.response?.data || error.message,
    );
  }
}

async function testGetCompanies() {
  console.log("\n=== Testing Get All Companies ===");
  try {
    const response = await api.get("/admin/companies", {
      params: {
        page: 1,
        limit: 5,
      },
    });
    console.log("✅ Get Companies Success:");
    console.log(`   Total Companies: ${response.data.data.total}`);
    console.log(
      `   Page: ${response.data.data.page}/${response.data.data.totalPages}`,
    );
    console.log(
      `   Companies on this page: ${response.data.data.items.length}`,
    );
  } catch (error) {
    console.error(
      "❌ Get Companies Failed:",
      error.response?.data || error.message,
    );
  }
}

async function runTests() {
  console.log("🚀 Starting Admin Features Tests...");
  console.log("📝 Note: Make sure to set a valid ADMIN_TOKEN in the script");
  console.log("🔗 API Base URL:", API_BASE_URL);

  if (ADMIN_TOKEN === "YOUR_ADMIN_TOKEN_HERE") {
    console.error("\n❌ ERROR: Please set a valid ADMIN_TOKEN in the script");
    console.log("\nTo get an admin token:");
    console.log("1. Login as admin user via POST /api/auth/login");
    console.log("2. Copy the token from the response");
    console.log("3. Replace YOUR_ADMIN_TOKEN_HERE in this script");
    process.exit(1);
  }

  // Test read operations first
  await testGetUsers();
  await testGetCompanies();

  // Test update operations
  await testUpdateUser();
  await testUpdateCompany();

  // Test password reset operations
  await testResetUserPassword();
  await testResetCompanyPassword();

  console.log("\n✨ All tests completed!");
}

// Run the tests
runTests().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
