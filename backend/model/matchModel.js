import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    status: {
      type: String,
      enum: ["active", "unmatched"],
      default: "active",
    },

    unmatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    unmatchedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

matchSchema.index({ users: 1 });

const Match = mongoose.model("Match", matchSchema);

export default Match;