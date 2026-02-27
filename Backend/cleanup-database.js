/**
 * Script to clean up incorrectly created SuperAdmin in Users table
 * and ensure SuperAdmin is in Tenants table
 * Run: node cleanup-database.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Eduvers';

async function cleanup() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define schemas
    const userSchema = new mongoose.Schema({
      email: String,
      userType: String,
      firstName: String,
      lastName: String
    });

    const tenantSchema = new mongoose.Schema({
      email: String,
      userType: String,
      name: String,
      OrgOwnerName: String
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);

    console.log('🔍 Checking for issues...\n');

    // Check for SUPERADMIN in Users table (wrong place)
    const wrongSuperAdmins = await User.find({ 
      userType: { $in: ['SUPERADMIN', 'superadmin'] } 
    });

    if (wrongSuperAdmins.length > 0) {
      console.log('❌ Found SuperAdmin(s) in USERS table (wrong place):');
      wrongSuperAdmins.forEach(user => {
        console.log(`  - Email: ${user.email}`);
        console.log(`    Type: ${user.userType}`);
        console.log(`    ID: ${user._id}\n`);
      });

      console.log('🗑️  Deleting incorrect SuperAdmin entries from Users table...');
      await User.deleteMany({ 
        userType: { $in: ['SUPERADMIN', 'superadmin'] } 
      });
      console.log('✅ Deleted!\n');
    } else {
      console.log('✅ No SuperAdmin found in Users table (good!)\n');
    }

    // Check for SuperAdmin in Tenants table (correct place)
    const correctSuperAdmins = await Tenant.find({ userType: 'superadmin' });

    console.log('📊 SuperAdmin Status in TENANTS table:');
    console.log(`  Found: ${correctSuperAdmins.length} SuperAdmin(s)\n`);

    if (correctSuperAdmins.length > 0) {
      console.log('✅ SuperAdmin(s) correctly placed in Tenants table:');
      correctSuperAdmins.forEach((admin, index) => {
        console.log(`  ${index + 1}. Email: ${admin.email}`);
        console.log(`     Name: ${admin.name || admin.OrgOwnerName || 'N/A'}`);
        console.log(`     ID: ${admin._id}\n`);
      });
    } else {
      console.log('⚠️  No SuperAdmin found in Tenants table!');
      console.log('\n💡 Next Steps:');
      console.log('1. Run: node create-superadmin.js');
      console.log('2. Or register at: http://localhost:3000/register-organization\n');
    }

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 CLEANUP SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Removed from Users table: ${wrongSuperAdmins.length}`);
    console.log(`SuperAdmins in Tenants table: ${correctSuperAdmins.length}`);
    console.log('═══════════════════════════════════════\n');

    if (correctSuperAdmins.length > 0) {
      console.log('✅ Database is clean! You can now:');
      console.log('1. Login at: http://localhost:3000/Login');
      console.log('2. Use one of the SuperAdmin emails shown above');
      console.log('3. If you forgot the password, run: node check-superadmin.js\n');
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanup();
