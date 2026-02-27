const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: ["Popular", "New"],
    },
    priceUSD: {
      type: Number,
      default: 0.0,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["USD", "INR", "EUR"],
      default: "USD",
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
courseSchema.index({ tenantId: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ tenantId: 1, createdBy: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
