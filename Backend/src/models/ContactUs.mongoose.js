const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "read", "replied", "spam"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
contactUsSchema.index({ email: 1 });
contactUsSchema.index({ status: 1 });
contactUsSchema.index({ userId: 1 });
contactUsSchema.index({ createdAt: -1 });

const ContactUs = mongoose.model("ContactUs", contactUsSchema);

module.exports = ContactUs;
