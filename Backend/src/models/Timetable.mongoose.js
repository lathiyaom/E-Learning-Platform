const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
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
    dayOfWeek: {
      type: String,
      required: true,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      lowercase: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    room: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["lecture", "lab", "tutorial", "practical", "seminar"],
      default: "lecture",
    },
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recurrenceStart: {
      type: Date,
      required: true,
    },
    recurrenceEnd: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes
timetableSchema.index({ tenantId: 1, courseId: 1 });
timetableSchema.index({ tenantId: 1, dayOfWeek: 1, isActive: 1 });
timetableSchema.index({ tenantId: 1, conductedBy: 1 });

// Validation: endTime must be after startTime
timetableSchema.pre("save", function (next) {
  const start = this.startTime.split(":").map(Number);
  const end = this.endTime.split(":").map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    next(new Error("End time must be after start time"));
  } else {
    next();
  }
});

// Validation: recurrenceEnd must be after recurrenceStart
timetableSchema.pre("save", function (next) {
  if (this.recurrenceEnd <= this.recurrenceStart) {
    next(new Error("Recurrence end date must be after start date"));
  } else {
    next();
  }
});

const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = Timetable;
