const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
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
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["seminar", "workshop", "webinar", "competition", "cultural", "sports", "conference", "other"],
      default: "other",
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetAudience: [
      {
        type: String,
        enum: ["all", "students", "teachers", "admins"],
      },
    ],
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    maxParticipants: {
      type: Number,
      min: 0,
    },
    registeredParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
eventSchema.index({ tenantId: 1, eventDate: 1 });
eventSchema.index({ tenantId: 1, status: 1, eventDate: 1 });
eventSchema.index({ tenantId: 1, type: 1 });

// Virtual for participant count
eventSchema.virtual("participantCount").get(function () {
  return this.registeredParticipants ? this.registeredParticipants.length : 0;
});

// Virtual for available slots
eventSchema.virtual("availableSlots").get(function () {
  if (!this.maxParticipants) return null;
  return this.maxParticipants - (this.registeredParticipants ? this.registeredParticipants.length : 0);
});

// Virtual for is full
eventSchema.virtual("isFull").get(function () {
  if (!this.maxParticipants) return false;
  return (this.registeredParticipants ? this.registeredParticipants.length : 0) >= this.maxParticipants;
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
