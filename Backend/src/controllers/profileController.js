const { User, Tenant } = require("../models");
const bcrypt = require("bcryptjs");
const {
  validatePassword,
  validateEmail,
  validatePhone,
  sanitizeString,
} = require("../utils/validators");

const buildTenantSettingsPayload = (tenant) => ({
  organizationName: tenant.name || "",
  organizationEmail: tenant.email || "",
  organizationPhone: tenant.phoneNo || "",
  ownerName: tenant.OrgOwnerName || "",
  ownerEmail: tenant.OrgOwnerEmail || "",
  ownerPhone: tenant.OrgOwnerPhone || "",
  organizationAbout: tenant.about || "",
});

const profileController = {
  /**
   * Get own profile (supports both User and Tenant accounts)
   * GET /Profile/me
   */
  getMe: async (req, res) => {
    try {
      const userId = req.user.id;
      const isTenant = req.user.role === "tenant";

      if (isTenant) {
        const tenant = await Tenant.findById(userId).select("-password -refreshToken -token");
        if (!tenant) {
          return res.status(404).json({ success: false, message: "Profile not found" });
        }
        const data = tenant.toObject ? tenant.toObject() : tenant;
        data.firstName = tenant.name || data.name;
        data.lastName = data.lastName || "";
        return res.status(200).json({
          success: true,
          message: "Profile retrieved successfully",
          data,
        });
      }

      const user = await User.findById(userId).select("-password -refreshToken -token");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update profile (User only; tenants use Tenant update route)
   * PATCH /Profile/update
   */
  updateProfile: async (req, res) => {
    try {
      if (req.user.role === "tenant") {
        return res.status(400).json({
          success: false,
          message: "Organization profile must be updated from organization settings",
        });
      }
      const userId = req.user.id;
      const { firstName, lastName, bio, phone, address, city, state, country, dateOfBirth, profileImage } = req.body;

      const allowedFields = ["firstName", "lastName", "bio", "phone", "address", "city", "state", "country", "dateOfBirth", "profileImage"];
      const updates = {};

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password -refreshToken");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Change password (User only)
   * PATCH /Profile/change-password
   */
  changePassword: async (req, res) => {
    try {
      if (req.user.role === "tenant") {
        return res.status(400).json({
          success: false,
          message: "Organization account password must be changed from organization settings",
        });
      }
      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All password fields are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirm password do not match",
        });
      }

      // Validate new password strength
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message,
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Upload profile picture (User only)
   * POST /Profile/upload-avatar
   */
  uploadAvatar: async (req, res) => {
    try {
      if (req.user.role === "tenant") {
        return res.status(400).json({
          success: false,
          message: "Organization accounts use organization settings for avatar",
        });
      }
      const userId = req.user.id;
      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        return res.status(400).json({
          success: false,
          message: "Avatar URL is required",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { profileImage: avatarUrl },
        { new: true }
      ).select("-password -refreshToken");

      res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get user settings (User only)
   * GET /Profile/settings
   */
  getSettings: async (req, res) => {
    try {
      if (req.user.role === "tenant") {
        const tenant = await Tenant.findById(req.user.id).select(
          "name email phoneNo OrgOwnerName OrgOwnerEmail OrgOwnerPhone about"
        );

        if (!tenant) {
          return res.status(404).json({
            success: false,
            message: "Organization profile not found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Settings retrieved successfully",
          data: buildTenantSettingsPayload(tenant),
        });
      }
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const settings = {
        emailNotifications: user.emailNotifications !== false,
        pushNotifications: user.pushNotifications !== false,
        smsNotifications: user.smsNotifications !== false,
        newsletter: user.newsletter !== false,
        twoFactorAuth: user.twoFactorEnabled === true,
        privacy: user.privacySettings || "public",
      };

      res.status(200).json({
        success: true,
        message: "Settings retrieved successfully",
        data: settings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update settings (User only)
   * PATCH /Profile/settings
   */
  updateSettings: async (req, res) => {
    try {
      if (req.user.role === "tenant") {
        const {
          organizationName,
          organizationEmail,
          organizationPhone,
          ownerName,
          ownerEmail,
          ownerPhone,
          organizationAbout,
        } = req.body;

        const updates = {};

        if (organizationName !== undefined) {
          const normalizedName = sanitizeString(organizationName);
          if (!normalizedName || normalizedName.length < 2) {
            return res.status(400).json({
              success: false,
              message: "Organization name must be at least 2 characters",
            });
          }
          updates.name = normalizedName;
        }

        if (organizationEmail !== undefined) {
          const emailCheck = validateEmail(organizationEmail);
          if (!emailCheck.valid) {
            return res.status(400).json({
              success: false,
              message: emailCheck.message,
            });
          }
          updates.email = String(organizationEmail).trim().toLowerCase();
        }

        if (organizationPhone !== undefined) {
          const phoneCheck = validatePhone(organizationPhone);
          if (!phoneCheck.valid) {
            return res.status(400).json({
              success: false,
              message: phoneCheck.message,
            });
          }
          updates.phoneNo = String(organizationPhone).trim();
        }

        if (ownerName !== undefined) {
          const normalizedOwnerName = sanitizeString(ownerName);
          if (!normalizedOwnerName || normalizedOwnerName.length < 2) {
            return res.status(400).json({
              success: false,
              message: "Owner name must be at least 2 characters",
            });
          }
          updates.OrgOwnerName = normalizedOwnerName;
        }

        if (ownerEmail !== undefined) {
          const ownerEmailCheck = validateEmail(ownerEmail);
          if (!ownerEmailCheck.valid) {
            return res.status(400).json({
              success: false,
              message: ownerEmailCheck.message,
            });
          }
          updates.OrgOwnerEmail = String(ownerEmail).trim().toLowerCase();
        }

        if (ownerPhone !== undefined) {
          const ownerPhoneCheck = validatePhone(ownerPhone);
          if (!ownerPhoneCheck.valid) {
            return res.status(400).json({
              success: false,
              message: ownerPhoneCheck.message,
            });
          }
          updates.OrgOwnerPhone = String(ownerPhone).trim();
        }

        if (organizationAbout !== undefined) {
          updates.about = sanitizeString(organizationAbout || "").slice(0, 1500);
        }

        if (Object.keys(updates).length === 0) {
          return res.status(400).json({
            success: false,
            message: "No valid fields provided to update",
          });
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(req.user.id, updates, {
          new: true,
          runValidators: true,
        }).select("name email phoneNo OrgOwnerName OrgOwnerEmail OrgOwnerPhone about");

        if (!updatedTenant) {
          return res.status(404).json({
            success: false,
            message: "Organization profile not found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Organization settings updated successfully",
          data: buildTenantSettingsPayload(updatedTenant),
        });
      }
      const userId = req.user.id;
      const { emailNotifications, pushNotifications, smsNotifications, newsletter, privacy } = req.body;

      const updates = {};
      if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
      if (pushNotifications !== undefined) updates.pushNotifications = pushNotifications;
      if (smsNotifications !== undefined) updates.smsNotifications = smsNotifications;
      if (newsletter !== undefined) updates.newsletter = newsletter;
      if (privacy !== undefined) updates.privacySettings = privacy;

      const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password -refreshToken");

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = profileController;
