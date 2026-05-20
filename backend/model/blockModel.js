import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      default: "",
      maxlength: [300, "Reason cannot be more than 300 characters"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate block
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const Block = mongoose.model("Block", blockSchema);

export default Block;