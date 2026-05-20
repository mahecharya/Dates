import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "User must be at least 18 years old"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot be more than 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },

    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },

    jobTitle: {
      type: String,
      default: "",
    },

    education: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
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
      ],
      default: "not-sure",
    },

    interests: {
      type: [String],
      default: [],
    },

    // Photos
    profilePhoto: {
      type: String,
      default: "",
    },

    photos: {
      type: [String],
      default: [],
    },

    // Role and status
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
    },

    otpExpire: {
      type: Date,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;