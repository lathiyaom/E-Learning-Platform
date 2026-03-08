const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    message_type: {
      type: String,
      enum: ["text", "file", "image", "link"],
      default: "text",
    },
    file_url: {
      type: String,
      default: null,
    },
    file_name: {
      type: String,
      default: null,
    },
    file_size: {
      type: Number, // in bytes
      default: null,
    },
    mime_type: {
      type: String,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    read_at: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    // For message threading
    reply_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // For message reactions
    reactions: [{
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      emoji: String,
      added_at: {
        type: Date,
        default: Date.now
      }
    }],
    // For message editing/deletion
    edited: {
      type: Boolean,
      default: false,
    },
    edited_at: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageSchema.index({ conversation_id: 1, created_at: 1 });
messageSchema.index({ sender_id: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ read_at: 1 });
messageSchema.index({ reply_to: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
