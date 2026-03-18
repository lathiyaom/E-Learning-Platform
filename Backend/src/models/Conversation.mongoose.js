const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    participant_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "participant_model",
    },
    participant_model: {
      type: String,
      enum: ["User", "Tenant"],
      required: true,
    },
    participant_role: {
      type: String,
      enum: ["student", "teacher", "admin", "superadmin"],
      required: true,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [participantSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: "Conversation must have at least two participants",
      },
      default: [],
    },
    participant_pair_key: {
      type: String,
      default: "",
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    last_message_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "archived", "blocked"],
      default: "active",
    },
    last_message: {
      type: String,
      maxlength: 500,
      default: "",
    },
    unread_student: {
      type: Boolean,
      default: false,
    },
    unread_teacher: {
      type: Boolean,
      default: false,
    },
    unread_by: {
      type: [String],
      default: [],
    },
    // Metadata
    course_context: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    subject: {
      type: String,
      maxlength: 200,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Backfill legacy student/teacher conversations that were created before participants[] existed.
conversationSchema.pre("validate", function legacyParticipantBackfill() {
  if (Array.isArray(this.participants) && this.participants.length >= 2) {
    return;
  }

  const nextParticipants = [];

  if (this.student_id) {
    nextParticipants.push({
      participant_id: this.student_id,
      participant_model: "User",
      participant_role: "student",
    });
  }

  if (this.teacher_id) {
    nextParticipants.push({
      participant_id: this.teacher_id,
      participant_model: "User",
      participant_role: "teacher",
    });
  }

  if (nextParticipants.length >= 2) {
    this.participants = nextParticipants;

    if (!this.participant_pair_key) {
      const keyA = `${nextParticipants[0].participant_model}:${String(nextParticipants[0].participant_id)}`;
      const keyB = `${nextParticipants[1].participant_model}:${String(nextParticipants[1].participant_id)}`;
      this.participant_pair_key = [keyA, keyB].sort().join("|");
    }
  }
});

// Ensure unique conversation between student and teacher
conversationSchema.index({ student_id: 1, teacher_id: 1 }, { unique: true });
conversationSchema.index(
  { organization_id: 1, participant_pair_key: 1 },
  {
    unique: true,
    partialFilterExpression: { participant_pair_key: { $type: "string", $ne: "" } },
  },
);
conversationSchema.index({ "participants.participant_id": 1, "participants.participant_model": 1 });
conversationSchema.index({ organization_id: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ last_message_at: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
