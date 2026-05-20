import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      age,
      gender,
      bio,
      jobTitle,
      education,
      city,
      country,
      relationshipGoal,
      interests,
      profilePhoto,
      photos,
    } = req.body;

    if (!name || !username || !email || !password || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, username, email, password, age, and gender are required",
      });
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: "User must be at least 18 years old",
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers, and underscores",
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters",
      });
    }

    const normalizedUsername = username.toLowerCase();
    const normalizedEmail = email.toLowerCase();

    const existingEmail = await User.findOne({ email: normalizedEmail });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isProfileComplete =
      name &&
      username &&
      email &&
      age &&
      gender &&
      bio &&
      city &&
      country &&
      relationshipGoal;

    const user = await User.create({
      name,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      age,
      gender,
      bio,
      jobTitle,
      education,
      city,
      country,
      relationshipGoal,
      interests,
      profilePhoto,
      photos,
      isProfileComplete: Boolean(isProfileComplete),
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          age: user.age,
          gender: user.gender,
          role: user.role,
          profilePhoto: user.profilePhoto,
          isEmailVerified: user.isEmailVerified,
          isProfileComplete: user.isProfileComplete,
        },
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or username and password are required",
      });
    }

    const query = email
      ? { email: email.toLowerCase() }
      : { username: username.toLowerCase() };

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    const token = generateToken(user._id);

    user.refreshToken = token;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          age: user.age,
          gender: user.gender,
          role: user.role,
          profilePhoto: user.profilePhoto,
          isEmailVerified: user.isEmailVerified,
          isProfileComplete: user.isProfileComplete,
        },
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// GET CURRENT LOGGED-IN USER
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -refreshToken -otp -otpExpire -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
      error: error.message,
    });
  }
};

// GET PUBLIC USER PROFILE BY ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire -refreshToken"
    );

    if (!user || user.isBanned) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// GET PUBLIC USER PROFILE BY USERNAME
export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: username.toLowerCase(),
      isBanned: false,
    }).select(
      "-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user by username",
      error: error.message,
    });
  }
};

// UPDATE CURRENT USER PROFILE
export const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      username,
      age,
      gender,
      bio,
      jobTitle,
      education,
      city,
      country,
      relationshipGoal,
      interests,
      profilePhoto,
      photos,
    } = req.body;

    if (age && age < 18) {
      return res.status(400).json({
        success: false,
        message: "User must be at least 18 years old",
      });
    }

    const updateData = {
      name,
      age,
      gender,
      bio,
      jobTitle,
      education,
      city,
      country,
      relationshipGoal,
      interests,
      profilePhoto,
      photos,
    };

    if (username !== undefined) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;

      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          success: false,
          message:
            "Username can only contain letters, numbers, and underscores",
        });
      }

      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Username must be between 3 and 30 characters",
        });
      }

      const normalizedUsername = username.toLowerCase();

      const existingUsername = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: userId },
      });

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already exists",
        });
      }

      updateData.username = normalizedUsername;
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const finalProfile = {
      ...existingUser.toObject(),
      ...updateData,
    };

    updateData.isProfileComplete = Boolean(
      finalProfile.name &&
        finalProfile.username &&
        finalProfile.email &&
        finalProfile.age &&
        finalProfile.gender &&
        finalProfile.bio &&
        finalProfile.city &&
        finalProfile.country &&
        finalProfile.relationshipGoal
    );

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).select(
      "-password -refreshToken -otp -otpExpire -resetPasswordToken -resetPasswordExpire"
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};

// UPDATE EMAIL
export const updateEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const existingEmail = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        email: normalizedEmail,
        isEmailVerified: false,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select(
      "-password -refreshToken -otp -otpExpire -resetPasswordToken -resetPasswordExpire"
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Email update failed",
      error: error.message,
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isOldPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Password change failed",
      error: error.message,
    });
  }
};

// LOGOUT USER
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      refreshToken: "",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// DELETE CURRENT USER
export const deleteCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Account deletion failed",
      error: error.message,
    });
  }
};