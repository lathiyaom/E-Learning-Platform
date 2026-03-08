const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed", "bounced"],
      default: "subscribed",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
newsletterSchema.index({ status: 1 });

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
