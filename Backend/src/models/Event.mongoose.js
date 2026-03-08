const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    event_type: {
      type: String,
      enum: ["holiday", "exam", "meeting", "workshop", "deadline", "celebration", "other"],
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      maxlength: 500,
      default: "",
    },
    target_role: {
      type: String,
      enum: ["all", "student", "teacher", "admin"],
      default: "all",
    },
    // For recurring events
    is_recurring: {
      type: Boolean,
      default: false,
    },
    recurring_pattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: null,
    },
    recurring_end_date: {
      type: Date,
      default: null,
    },
    // Event visibility
    is_public: {
      type: Boolean,
      default: true,
    },
    requires_registration: {
      type: Boolean,
      default: false,
    },
    registration_deadline: {
      type: Date,
      default: null,
    },
    max_participants: {
      type: Number,
      default: null,
    },
    current_participants: {
      type: Number,
      default: 0,
    },
    // Event resources
    attachments: [{
      file_name: String,
      file_url: String,
      file_size: Number,
      mime_type: String
    }],
    // Event status
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    // Created by
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reminders
    reminders: [{
      type: {
        type: String,
        enum: ["email", "notification", "sms"],
        default: "email"
      },
      time_before: {
        type: Number, // minutes before event
        default: 60
      },
      sent: {
        type: Boolean,
        default: false
      }
    }],
    // Event color for calendar
    color: {
      type: String,
      default: "#3B82F6", // Blue
    },
    // Event tags
    tags: [{
      type: String,
      maxlength: 50
    }],
    // Legacy fields for backward compatibility
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    eventDate: {
      type: Date,
    },
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    type: {
      type: String,
      enum: ["seminar", "workshop", "webinar", "competition", "cultural", "sports", "conference", "other"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetAudience: [{
      type: String,
      enum: ["all", "students", "teachers", "admins"],
    }],
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    maxParticipants: {
      type: Number,
      min: 0,
    },
    registeredParticipants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    imageUrl: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes
eventSchema.index({ organization_id: 1, start_date: 1 });
eventSchema.index({ organization_id: 1, status: 1 });
eventSchema.index({ target_role: 1 });
eventSchema.index({ event_type: 1 });
eventSchema.index({ created_by: 1 });
// Legacy indexes for backward compatibility
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
