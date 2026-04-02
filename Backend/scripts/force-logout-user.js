/**
 * Force Logout User - Clear user session from database
 * 
 * Usage: node force-logout-user.js <email>
 * Example: node force-logout-user.js abc@gmail.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Tenant } = require('./src/models');

const forceLogout = async (email) => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    if (!email) {
      console.error('❌ Error: Email is required');
      console.log('Usage: node force-logout-user.js <email>');
      console.log('Example: node force-logout-user.js abc@gmail.com');
      process.exit(1);
    }

    // Try to find user in Tenant collection first
    let account = await Tenant.findOne({ email });
    let accountType = 'Tenant';

    // If not found, try User collection
    if (!account) {
      account = await User.findOne({ email });
      accountType = 'User';
    }

    if (!account) {
      console.log(`❌ No account found with email: ${email}`);
      process.exit(1);
    }

    // Check if user has active session
    if (!account.token && !account.refreshToken) {
      console.log(`ℹ️  User ${email} is not logged in (no active session)`);
      process.exit(0);
    }

    // Clear tokens
    account.token = null;
    account.refreshToken = null;
    await account.save();

    console.log(`✅ Successfully logged out user: ${email}`);
    console.log(`   Account Type: ${accountType}`);
    console.log(`   User Type: ${account.userType}`);
    console.log(`   Name: ${account.firstName || account.name} ${account.lastName || ''}`);
    console.log('\n💡 User can now login again with fresh credentials');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Get email from command line arguments
const email = process.argv[2];
forceLogout(email);
