import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// For fetching messages of one match in correct order
messageSchema.index({ match: 1, createdAt: 1 });

// For unread message queries
messageSchema.index({ receiver: 1, isRead: 1 });

// For sender history
messageSchema.index({ sender: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;