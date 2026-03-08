const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    rated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    target_type: {
      type: String,
      enum: ["course", "teacher"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    // For course ratings
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    // For teacher ratings
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "hidden", "reported"],
      default: "active",
    },
    helpful_count: {
      type: Number,
      default: 0,
    },
    report_count: {
      type: Number,
      default: 0,
    },
    reported_by: [{
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reason: String,
      reported_at: {
        type: Date,
        default: Date.now
      }
    }],
    // Legacy fields for backward compatibility
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    categories: {
      content: {
        type: Number,
        min: 1,
        max: 5,
      },
      instructor: {
        type: Number,
        min: 1,
        max: 5,
      },
      difficulty: {
        type: Number,
        min: 1,
        max: 5,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes
ratingSchema.index({ rated_by: 1, target_id: 1, target_type: 1 }, { unique: true });
ratingSchema.index({ target_id: 1, target_type: 1 });
ratingSchema.index({ organization_id: 1 });
ratingSchema.index({ status: 1 });
// Legacy indexes for backward compatibility
ratingSchema.index({ tenantId: 1, courseId: 1 });
ratingSchema.index({ tenantId: 1, studentId: 1 });
ratingSchema.index({ tenantId: 1, courseId: 1, studentId: 1 }, { unique: true });

// Virtual for average category rating
ratingSchema.virtual("categoryAverage").get(function () {
  if (!this.categories) return null;
  
  const values = Object.values(this.categories).filter(v => v != null);
  if (values.length === 0) return null;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return (sum / values.length).toFixed(2);
});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
