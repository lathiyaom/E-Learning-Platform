const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but enforce uniqueness when present
      uppercase: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["admin", "superadmin"],
      required: true,
    },
    OrgOwnerName: {
      type: String,
      required: true,
    },
    OrgOwnerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    OrgOwnerPhone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    agreeTerms: {
      type: Boolean,
      default: false,
    },
    about: {
      type: String,
      default: "",
    },
    token: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    sessions: [
      {
        sid: {
          type: String,
          required: true,
        },
        accessToken: {
          type: String,
          required: true,
        },
        refreshToken: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        lastUsedAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour default
        },
      },
    ],
    // ✅ Teachers assigned to this organization
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

tenantSchema.index({ "sessions.sid": 1 });

// Hash password before saving
tenantSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // ✅ Auto-generate organization code if not provided
  if (!this.code && this.userType === "admin") {
    // Generate code from organization name (e.g., "ABC School" -> "ABCSCH")
    const nameCode = this.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 6);
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.code = `${nameCode}${randomSuffix}`;
  }
});

// Compare password method
tenantSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
