const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ✅ Primary tenant for this user (for multi-tenant isolation)
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    // ✅ Organizations/tenants this user is assigned to (for multi-tenant support)
    organizations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
      },
    ],
    // ✅ Currently selected organization (for context switching)
    currentOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
    userType: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },
    available_for_org: {
      type: Boolean,
      default: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: false,
    },
    phoneNo: {
      type: String,
      required: false,
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
    agreeTerms: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    about: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: null,
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
  },
  {
    timestamps: true,
  }
);

// Index for tenant-scoped queries
userSchema.index({ tenant_id: 1, email: 1 });
userSchema.index({ "sessions.sid": 1 });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
