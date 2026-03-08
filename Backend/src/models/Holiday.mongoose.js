const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      required: true,
    },
    holiday_type: {
      type: String,
      enum: ["public", "restricted", "optional"],
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    // For recurring holidays
    is_recurring: {
      type: Boolean,
      default: false,
    },
    recurring_pattern: {
      type: String,
      enum: ["yearly", "monthly", "weekly"],
      default: null,
    },
    recurring_end_date: {
      type: Date,
      default: null,
    },
    // Holiday affects specific roles
    affects_roles: [{
      type: String,
      enum: ["all", "student", "teacher", "admin"]
    }],
    // Holiday duration
    is_full_day: {
      type: Boolean,
      default: true,
    },
    start_time: {
      type: String, // HH:MM format
      default: null,
    },
    end_time: {
      type: String, // HH:MM format
      default: null,
    },
    // Created by
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Holiday status
    status: {
      type: String,
      enum: ["active", "cancelled", "draft"],
      default: "active",
    },
    // Holiday color for calendar
    color: {
      type: String,
      default: "#EF4444", // Red
    },
    // Holiday tags
    tags: [{
      type: String,
      maxlength: 50
    }],
    // Notifications
    send_reminder: {
      type: Boolean,
      default: true,
    },
    reminder_sent: {
      type: Boolean,
      default: false,
    },
    // Legacy fields for backward compatibility
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
    endDate: {
      type: Date,
    },
    type: {
      type: String,
      enum: ["platform", "organization", "national", "regional", "religious"],
      default: "organization",
    },
    isRecurring: {
      type: Boolean,
      default: false,
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
holidaySchema.index({ organization_id: 1, date: 1 });
holidaySchema.index({ organization_id: 1, holiday_type: 1 });
holidaySchema.index({ date: 1 });
holidaySchema.index({ status: 1 });
holidaySchema.index({ created_by: 1 });
// Legacy indexes for backward compatibility
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
