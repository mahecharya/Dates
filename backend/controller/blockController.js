import mongoose from "mongoose";
import Block from "../model/blockModel.js";
import User from "../model/userModel.js";
import Match from "../model/matchModel.js";

// BLOCK USER
export const blockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { blockedUserId, reason } = req.body;

    if (!blockedUserId) {
      return res.status(400).json({
        success: false,
        message: "blockedUserId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(blockedUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blocked user ID",
      });
    }

    if (blockerId.toString() === blockedUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    const blockedUser = await User.findById(blockedUserId);

    if (!blockedUser) {
      return res.status(404).json({
        success: false,
        message: "User to block not found",
      });
    }

    const existingBlock = await Block.findOne({
      blocker: blockerId,
      blocked: blockedUserId,
    });

    if (existingBlock) {
      return res.status(409).json({
        success: false,
        message: "You have already blocked this user",
      });
    }

    const block = await Block.create({
      blocker: blockerId,
      blocked: blockedUserId,
      reason: reason || "",
    });

    // Optional: unmatch users if they are currently matched
    await Match.findOneAndUpdate(
      {
        users: { $all: [blockerId, blockedUserId] },
        status: "active",
      },
      {
        status: "unmatched",
        unmatchedBy: blockerId,
        unmatchedAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

    return res.status(201).json({
      success: true,
      message: "User blocked successfully",
      data: block,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already blocked this user",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to block user",
      error: error.message,
    });
  }
};

// GET MY BLOCKED USERS
export const getMyBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const blockedUsers = await Block.find({
      blocker: userId,
    })
      .populate(
        "blocked",
        "name email age gender bio city country profilePhoto relationshipGoal"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Blocked users fetched successfully",
      count: blockedUsers.length,
      data: blockedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blocked users",
      error: error.message,
    });
  }
};

// CHECK IF I BLOCKED A USER OR THEY BLOCKED ME
export const checkBlockStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const block = await Block.findOne({
      $or: [
        { blocker: userId, blocked: otherUserId },
        { blocker: otherUserId, blocked: userId },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Block status fetched successfully",
      data: {
        isBlocked: Boolean(block),
        block,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check block status",
      error: error.message,
    });
  }
};

// UNBLOCK USER
export const unblockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { blockedUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(blockedUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blocked user ID",
      });
    }

    const block = await Block.findOneAndDelete({
      blocker: blockerId,
      blocked: blockedUserId,
    });

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unblock user",
      error: error.message,
    });
  }
};