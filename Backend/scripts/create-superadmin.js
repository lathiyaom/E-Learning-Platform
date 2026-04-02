/**
 * Script to create the first SuperAdmin account
 * Run this ONCE when setting up the platform for the first time
 * 
 * Usage: node create-superadmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Eduvers';

// SuperAdmin details - CHANGE THESE!
const SUPERADMIN_DATA = {
  name: 'EduVerse Platform',
  phoneNo: '1234567890',
  userType: 'superadmin', // lowercase to match Tenant model enum
  OrgOwnerName: 'Super Admin',
  OrgOwnerEmail: 'admin@eduverse.com',
  OrgOwnerPhone: '1234567890',
  email: 'superadmin@eduverse.com',
  password: 'SuperAdmin123!', // CHANGE THIS!
  status: 'active',
  agreeTerms: true
};

async function createSuperAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define Tenant schema (matching Tenant.mongoose.js)
    const tenantSchema = new mongoose.Schema({
      name: String,
      phoneNo: String,
      email: { type: String, unique: true },
      password: String,
      userType: String,
      OrgOwnerName: String,
      OrgOwnerEmail: String,
      OrgOwnerPhone: String,
      status: String,
      agreeTerms: Boolean,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);

    // Check if SuperAdmin already exists
    const existingSuperAdmin = await Tenant.findOne({ 
      userType: 'superadmin' 
    });

    if (existingSuperAdmin) {
      console.log('⚠️  SuperAdmin already exists!');
      console.log('📧 Email:', existingSuperAdmin.email);
      console.log('🆔 ID:', existingSuperAdmin._id);
      console.log('\n💡 If you want to create a new SuperAdmin, delete the existing one first.');
      process.exit(0);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(SUPERADMIN_DATA.password, 10);

    // Create SuperAdmin
    console.log('👤 Creating SuperAdmin account...');
    const superAdmin = await Tenant.create({
      ...SUPERADMIN_DATA,
      password: hashedPassword
    });

    console.log('\n✅ SuperAdmin created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Password:', SUPERADMIN_DATA.password);
    console.log('🆔 ID:', superAdmin._id);
    console.log('👤 Role:', superAdmin.userType);
    console.log('═══════════════════════════════════════\n');
    
    console.log('🎯 Next Steps:');
    console.log('1. Login at: http://localhost:3000/Login');
    console.log('2. Use the email and password above');
    console.log('3. Navigate to: http://localhost:3000/superadmin/dashboard');
    console.log('4. Start managing your platform!\n');

    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('⚠️  SECURITY: Delete or secure this script file!\n');

  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error.message);
    if (error.code === 11000) {
      console.error('💡 Email already exists. Use a different email or delete the existing account.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createSuperAdmin();
