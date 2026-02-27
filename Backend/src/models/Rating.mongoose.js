const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
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
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
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
