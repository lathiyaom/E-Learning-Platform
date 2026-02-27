/**
 * Script to check SuperAdmin status and optionally reset password
 * Run: node check-superadmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Eduvers';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function checkSuperAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const tenantSchema = new mongoose.Schema({
      name: String,
      phoneNo: String,
      email: String,
      password: String,
      userType: String,
      OrgOwnerName: String,
      OrgOwnerEmail: String,
      OrgOwnerPhone: String,
      status: String,
      agreeTerms: Boolean,
      createdAt: Date
    });

    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);

    // Check for SuperAdmin
    const superAdmins = await Tenant.find({ userType: 'superadmin' });
    const allTenants = await Tenant.countDocuments({ 
      userType: { $in: ['admin', 'superadmin'] } 
    });

    console.log('═══════════════════════════════════════');
    console.log('📊 SUPERADMIN STATUS');
    console.log('═══════════════════════════════════════');
    console.log(`Total Tenants: ${allTenants}`);
    console.log(`SuperAdmins Found: ${superAdmins.length}\n`);

    if (superAdmins.length === 0) {
      console.log('❌ No SuperAdmin exists!');
      console.log('\n💡 Solutions:');
      console.log('1. Run: node create-superadmin.js');
      console.log('2. Or register at: http://localhost:3000/register-organization');
      console.log('   (First registration becomes SuperAdmin)\n');
      
      await mongoose.disconnect();
      rl.close();
      process.exit(0);
    }

    // Display SuperAdmin details
    superAdmins.forEach((admin, index) => {
      console.log(`SuperAdmin #${index + 1}:`);
      console.log(`  📧 Email: ${admin.email}`);
      console.log(`  👤 Name: ${admin.name || 'N/A'}`);
      console.log(`  👤 Owner: ${admin.OrgOwnerName || 'N/A'}`);
      console.log(`  📅 Created: ${admin.createdAt ? admin.createdAt.toLocaleDateString() : 'N/A'}`);
      console.log(`  ✅ Status: ${admin.status || 'N/A'}`);
      console.log(`  🆔 ID: ${admin._id}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════\n');

    // Ask if user wants to reset password
    rl.question('Do you want to reset the SuperAdmin password? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        rl.question('Enter new password (min 8 chars, strong recommended): ', async (newPassword) => {
          if (newPassword.length < 8) {
            console.log('❌ Password must be at least 8 characters!');
            await mongoose.disconnect();
            rl.close();
            process.exit(1);
          }

          try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update first SuperAdmin
            const admin = superAdmins[0];
            admin.password = hashedPassword;
            await admin.save();

            console.log('\n✅ Password reset successfully!');
            console.log('═══════════════════════════════════════');
            console.log('📧 Email:', admin.email);
            console.log('🔑 New Password:', newPassword);
            console.log('═══════════════════════════════════════\n');
            console.log('🎯 Next Steps:');
            console.log('1. Login at: http://localhost:3000/Login');
            console.log('2. Use the email and new password above');
            console.log('3. Navigate to: http://localhost:3000/superadmin/dashboard\n');
            console.log('⚠️  IMPORTANT: Change this password after first login!');
            console.log('⚠️  SECURITY: Keep this password secure!\n');

          } catch (error) {
            console.error('❌ Error resetting password:', error.message);
          }

          await mongoose.disconnect();
          rl.close();
          process.exit(0);
        });
      } else {
        console.log('\n💡 To login:');
        console.log('1. Go to: http://localhost:3000/Login');
        console.log('2. Use the email shown above');
        console.log('3. Enter your password\n');
        console.log('💡 If you forgot the password, run this script again and choose "yes"\n');
        
        await mongoose.disconnect();
        rl.close();
        process.exit(0);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
}

checkSuperAdmin();
