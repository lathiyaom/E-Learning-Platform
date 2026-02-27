const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 2000,
    },
    subject: {
      type: String,
      enum: ["course", "teacher", "content", "platform"],
      default: "course",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  { timestamps: true }
);

// Compound indexes
feedbackSchema.index({ tenantId: 1, courseId: 1 });
feedbackSchema.index({ tenantId: 1, reviewerId: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
