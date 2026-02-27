const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
    },
    type: {
      type: String,
      enum: ["platform", "organization", "national", "regional", "religious"],
      default: "organization",
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#EF4444",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes
holidaySchema.index({ tenantId: 1, date: 1 });
holidaySchema.index({ type: 1, date: 1 });
holidaySchema.index({ date: 1, endDate: 1 });

// Virtual for duration in days
holidaySchema.virtual("durationDays").get(function () {
  if (!this.endDate) return 1;
  const diffTime = Math.abs(this.endDate - this.date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
});

// Virtual for is multi-day
holidaySchema.virtual("isMultiDay").get(function () {
  return this.endDate && this.endDate > this.date;
});

// Validation: endDate must be after or equal to date
holidaySchema.pre("save", function (next) {
  if (this.endDate && this.endDate < this.date) {
    next(new Error("End date must be after or equal to start date"));
  } else {
    next();
  }
});

const Holiday = mongoose.model("Holiday", holidaySchema);

module.exports = Holiday;
