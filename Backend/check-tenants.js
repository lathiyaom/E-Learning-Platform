/**
 * Quick script to check tenant count in database
 * Run with: node check-tenants.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const checkTenants = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Import Tenant model
    const Tenant = require("./src/models/Tenant.mongoose");

    // Count tenants
    const count = await Tenant.countDocuments();
    console.log(`\n📊 Total tenants in database: ${count}`);

    if (count > 0) {
      console.log("\n📋 Existing tenants:");
      const tenants = await Tenant.find().select("name email userType status createdAt");
      tenants.forEach((tenant, index) => {
        console.log(`\n${index + 1}. ${tenant.name}`);
        console.log(`   Email: ${tenant.email}`);
        console.log(`   Type: ${tenant.userType}`);
        console.log(`   Status: ${tenant.status}`);
        console.log(`   Created: ${tenant.createdAt}`);
      });

      console.log("\n⚠️  To allow new organization registration:");
      console.log("   Option 1: Delete all tenants (for testing):");
      console.log("   > node clear-tenants.js");
      console.log("\n   Option 2: Login as superadmin to create new organizations");
    } else {
      console.log("\n✅ No tenants found - first registration will create superadmin");
    }

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkTenants();
