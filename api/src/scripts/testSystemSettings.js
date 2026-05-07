import { AdminService } from "../services/adminService.js";

async function testSystemSettings() {
  try {
    console.log("🧪 Testing System Settings...\n");

    // Test 1: Get all settings
    console.log("1️⃣ Fetching all settings...");
    const settings = await AdminService.getSettings();
    console.log("✅ Settings fetched successfully:");
    console.log(JSON.stringify(settings, null, 2));
    console.log("");

    // Test 2: Get a single setting
    console.log("2️⃣ Fetching single setting (maintenance_mode)...");
    const maintenanceMode = await AdminService.getSetting("maintenance_mode");
    console.log(`✅ maintenance_mode = ${maintenanceMode}`);
    console.log("");

    // Test 3: Update a setting
    console.log("3️⃣ Updating maintenance_mode to true...");
    await AdminService.updateSetting("maintenance_mode", true);
    const updatedMaintenanceMode =
      await AdminService.getSetting("maintenance_mode");
    console.log(`✅ Updated maintenance_mode = ${updatedMaintenanceMode}`);
    console.log("");

    // Test 4: Update multiple settings
    console.log("4️⃣ Updating multiple settings...");
    const updatedSettings = await AdminService.updateSettings({
      maintenance_mode: false,
      registration_enabled: true,
      booking_enabled: true,
      site_name: "East Hararghe Tours - Updated",
    });
    console.log("✅ Multiple settings updated successfully");
    console.log("Updated values:");
    console.log(`  - maintenance_mode: ${updatedSettings.maintenance_mode}`);
    console.log(
      `  - registration_enabled: ${updatedSettings.registration_enabled}`,
    );
    console.log(`  - booking_enabled: ${updatedSettings.booking_enabled}`);
    console.log(`  - site_name: ${updatedSettings.site_name}`);
    console.log("");

    // Test 5: Verify settings persist
    console.log("5️⃣ Verifying settings persistence...");
    const verifySettings = await AdminService.getSettings();
    console.log("✅ Settings verified:");
    console.log(`  - maintenance_mode: ${verifySettings.maintenance_mode}`);
    console.log(
      `  - registration_enabled: ${verifySettings.registration_enabled}`,
    );
    console.log(`  - booking_enabled: ${verifySettings.booking_enabled}`);
    console.log(`  - site_name: ${verifySettings.site_name}`);
    console.log("");

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run the tests
testSystemSettings()
  .then(() => {
    console.log("\n✅ System settings test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ System settings test failed:", error);
    process.exit(1);
  });
