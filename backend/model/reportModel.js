import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: [true, "Report reason is required"],
      enum: [
        "fake_profile",
        "harassment",
        "spam",
        "scam",
        "inappropriate_photo",
        "abusive_language",
        "underage",
        "other",
      ],
    },

    description: {
      type: String,
      default: "",
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminNote: {
      type: String,
      default: "",
      maxlength: [1000, "Admin note cannot be more than 1000 characters"],
    },
  },
  { timestamps: true }
);

// Prevent same user from reporting same person repeatedly for the same reason
reportSchema.index(
  { reporter: 1, reportedUser: 1, reason: 1 },
  { unique: true }
);

reportSchema.index({ reportedUser: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;