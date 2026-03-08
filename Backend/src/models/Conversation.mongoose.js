const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    // Metadata
    course_context: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    subject: {
      type: String,
      maxlength: 200,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

// Ensure unique conversation between student and teacher
conversationSchema.index({ student_id: 1, teacher_id: 1 }, { unique: true });
conversationSchema.index({ organization_id: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ last_message_at: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
