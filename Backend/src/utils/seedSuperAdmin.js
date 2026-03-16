const logger = require("./logger");

/**
 * Seeds the platform Super Admin account on startup.
 * Idempotent — safe to run on every restart.
 *
 * Super Admin:
 *  - Lives in the Tenant collection with userType: "superadmin"
 *  - Does NOT belong to any organization (no org code)
 *  - Can log in via the normal /Auth/Login endpoint
 *  - Has read-only access to platform-level data only
 */
const seedSuperAdmin = async () => {
  // Lazy-require to avoid circular dependency issues at module load time
  const { Tenant } = require("../models");

  const email = process.env.SUPERADMIN_EMAIL || "superadmin@eduverse.com";
  const plainPassword = process.env.SUPERADMIN_PASSWORD || "SuperAdmin123!";

  try {
    // Check by email first (most specific), then fall back to any superadmin
    const existing = await Tenant.findOne({ email });

    if (existing) {
      // Ensure the existing record has the correct userType
      if (existing.userType !== "superadmin") {
        existing.userType = "superadmin";
        await existing.save();
        logger.info("Super Admin userType corrected", { email });
      } else {
        logger.info("Super Admin already exists — skipping seed", { email });
      }
      return;
    }

    // Pass plain password — the Tenant pre-save hook will hash it
    await Tenant.create({
      name: "Platform Owner",
      // No 'code' — Super Admin is not an organization
      phoneNo: "0000000000",
      userType: "superadmin",
      OrgOwnerName: "Platform Owner",
      OrgOwnerEmail: email,
      OrgOwnerPhone: "0000000000",
      email,
      password: plainPassword,
      status: "active",
      agreeTerms: true,
      about: "Global platform owner account. Read-only access to all organizations.",
    });

    logger.info("✅ Super Admin seeded successfully", { email });
  } catch (error) {
    logger.error("❌ Failed to seed Super Admin", {
      errorMessage: error.message,
    });
    // Don't crash the server — log and continue
  }
};

module.exports = seedSuperAdmin;
