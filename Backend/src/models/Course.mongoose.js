const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    video_url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    image: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: ["Popular", "New"],
    },
    pricing: {
      type: Number,
      default: 0.0,
      min: 0,
    },
    price: {
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
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    level: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // Legacy fields for backward compatibility
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    videoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
courseSchema.index({ organization_id: 1 });
courseSchema.index({ teacher_id: 1 });
courseSchema.index({ organization_id: 1, teacher_id: 1 });
courseSchema.index({ tenantId: 1, subjectId: 1 });
// Legacy indexes for backward compatibility
courseSchema.index({ tenantId: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ tenantId: 1, createdBy: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
