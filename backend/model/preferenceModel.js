import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    preferredGender: {
      type: String,
      enum: ["male", "female", "other", "any"],
      default: "any",
    },

    minAge: {
      type: Number,
      required: true,
      min: [18, "Minimum age must be at least 18"],
      default: 18,
    },

    maxAge: {
      type: Number,
      required: true,
      min: [18, "Maximum age must be at least 18"],
      default: 35,
    },

    maxDistanceKm: {
      type: Number,
      default: 50,
      min: [1, "Distance must be at least 1 km"],
    },

    relationshipGoal: {
      type: String,
      enum: [
        "long-term",
        "short-term",
        "friendship",
        "casual",
        "marriage",
        "not-sure",
        "any",
      ],
      default: "any",
    },

    interests: {
      type: [String],
      default: [],
    },

    city: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Preference = mongoose.model("Preference", preferenceSchema);

export default Preference;