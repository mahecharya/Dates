import mongoose from "mongoose";
import User from "../model/userModel.js";
import Report from "../model/reportModel.js";
import Match from "../model/matchModel.js";
import Swipe from "../model/swipeModel.js";
import Message from "../model/messageModel.js";
import Block from "../model/blockModel.js";
import Photo from "../model/photoModel.js";
import Notification from "../model/notificationModel.js";
import { createNotification } from "../utils/createNotification.js";

// ADMIN: GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      isBanned,
      gender,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (gender) {
      query.gender = gender;
    }

    if (isBanned === "true") {
      query.isBanned = true;
    }

    if (isBanned === "false") {
      query.isBanned = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const users = await User.find(query)
      .select("-password -refreshToken -otp -otpExpire -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalUsers = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      pagination: {
        totalUsers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
      },
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ADMIN: GET SINGLE USER DETAIL
export const getUserByIdForAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select(
      "-password -refreshToken -otp -otpExpire -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const photos = await Photo.find({ user: userId }).sort({
      isPrimary: -1,
      createdAt: 1,
    });

    const reportsAgainstUser = await Report.find({
      reportedUser: userId,
    })
      .populate("reporter", "name email profilePhoto")
      .sort({ createdAt: -1 });

    const userReports = await Report.find({
      reporter: userId,
    })
      .populate("reportedUser", "name email profilePhoto")
      .sort({ createdAt: -1 });

    const matchCount = await Match.countDocuments({
      users: userId,
      status: "active",
    });

    const swipeCount = await Swipe.countDocuments({
      swiper: userId,
    });

    const messageCount = await Message.countDocuments({
      sender: userId,
    });

    const blockedCount = await Block.countDocuments({
      blocker: userId,
    });

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        user,
        photos,
        stats: {
          matchCount,
          swipeCount,
          messageCount,
          blockedCount,
          reportsAgainstUserCount: reportsAgainstUser.length,
          userReportsCount: userReports.length,
        },
        reportsAgainstUser,
        userReports,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// ADMIN: BAN USER
export const banUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (adminId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot ban own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: true,
      },
      {
        returnDocument: "after",
      }
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await createNotification({
      user: userId,
      type: "admin_warning",
      title: "Account Banned",
      message: reason || "Your account has been banned by admin.",
      relatedUser: adminId,
    });

    return res.status(200).json({
      success: true,
      message: "User banned successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to ban user",
      error: error.message,
    });
  }
};

// ADMIN: UNBAN USER
export const unbanUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: false,
      },
      {
        returnDocument: "after",
      }
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await createNotification({
      user: userId,
      type: "admin_warning",
      title: "Account Unbanned",
      message: "Your account has been unbanned by admin.",
      relatedUser: adminId,
    });

    return res.status(200).json({
      success: true,
      message: "User unbanned successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unban user",
      error: error.message,
    });
  }
};

// ADMIN: CHANGE USER ROLE
export const updateUserRole = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be user or admin",
      });
    }

    if (adminId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot change own role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        role,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await createNotification({
      user: userId,
      type: "admin_warning",
      title: "Role Updated",
      message: `Your account role has been updated to ${role}.`,
      relatedUser: adminId,
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// ADMIN: DELETE USER
export const deleteUserByAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (adminId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete own account",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(userId);

    await Photo.deleteMany({ user: userId });

    await Swipe.deleteMany({
      $or: [
        { swiper: userId },
        { target: userId },
      ],
    });

    await Match.deleteMany({
      users: userId,
    });

    await Message.deleteMany({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    });

    await Block.deleteMany({
      $or: [
        { blocker: userId },
        { blocked: userId },
      ],
    });

    await Notification.deleteMany({
      user: userId,
    });

    return res.status(200).json({
      success: true,
      message: "User and related data deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// ADMIN: GET DASHBOARD STATS
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const adminUsers = await User.countDocuments({ role: "admin" });

    const totalPhotos = await Photo.countDocuments();
    const totalSwipes = await Swipe.countDocuments();
    const totalMatches = await Match.countDocuments();
    const activeMatches = await Match.countDocuments({ status: "active" });
    const unmatchedMatches = await Match.countDocuments({ status: "unmatched" });

    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });

    const totalBlocks = await Block.countDocuments();

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const resolvedReports = await Report.countDocuments({ status: "resolved" });
    const rejectedReports = await Report.countDocuments({ status: "rejected" });

    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });

    return res.status(200).json({
      success: true,
      message: "Admin dashboard stats fetched successfully",
      data: {
        users: {
          totalUsers,
          activeUsers,
          bannedUsers,
          adminUsers,
        },
        photos: {
          totalPhotos,
        },
        swipes: {
          totalSwipes,
        },
        matches: {
          totalMatches,
          activeMatches,
          unmatchedMatches,
        },
        messages: {
          totalMessages,
          unreadMessages,
        },
        blocks: {
          totalBlocks,
        },
        reports: {
          totalReports,
          pendingReports,
          resolvedReports,
          rejectedReports,
        },
        notifications: {
          totalNotifications,
          unreadNotifications,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
      error: error.message,
    });
  }
};