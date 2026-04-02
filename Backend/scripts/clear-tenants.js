/**
 * Script to clear all tenants from database (FOR TESTING ONLY)
 * Run with: node clear-tenants.js
 * 
 * WARNING: This will delete ALL tenants and their associated data!
 */

require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const clearTenants = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Import models
    const Tenant = require("./src/models/Tenant.mongoose");
    const User = require("./src/models/User.mongoose");

    // Count existing data
    const tenantCount = await Tenant.countDocuments();
    const userCount = await User.countDocuments();

    console.log(`\n⚠️  WARNING: This will delete:`);
    console.log(`   - ${tenantCount} tenant(s)`);
    console.log(`   - ${userCount} user(s)`);
    console.log(`\n   This action CANNOT be undone!`);

    rl.question('\nType "DELETE" to confirm: ', async (answer) => {
      if (answer === "DELETE") {
        console.log("\n🗑️  Deleting all tenants and users...");
        
        await Tenant.deleteMany({});
        await User.deleteMany({});
        
        console.log("✅ All tenants and users deleted");
        console.log("\n✅ You can now register the first organization (will become superadmin)");
      } else {
        console.log("\n❌ Deletion cancelled");
      }

      await mongoose.disconnect();
      console.log("✅ Disconnected from MongoDB");
      rl.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    rl.close();
    process.exit(1);
  }
};

clearTenants();
