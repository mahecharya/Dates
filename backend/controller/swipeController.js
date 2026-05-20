import mongoose from "mongoose";
import Swipe from "../model/swipeModel.js";
import Match from "../model/matchModel.js";
import User from "../model/userModel.js";
import Block from "../model/blockModel.js";
import { createNotification } from "../utils/createNotification.js";

// CREATE SWIPE
export const createSwipe = async (req, res) => {
  try {
    const swiperId = req.user.id;
    const { targetUserId, action } = req.body;

    if (!targetUserId || !action) {
      return res.status(400).json({
        success: false,
        message: "targetUserId and action are required",
      });
    }

    if (!["like", "dislike"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either like or dislike",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target user ID",
      });
    }

    if (swiperId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot swipe on yourself",
      });
    }

    const blockExists = await Block.findOne({
      $or: [
        { blocker: swiperId, blocked: targetUserId },
        { blocker: targetUserId, blocked: swiperId },
      ],
    });

    if (blockExists) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot swipe this user because one of you has blocked the other",
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser || targetUser.isBanned) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    const existingSwipe = await Swipe.findOne({
      swiper: swiperId,
      target: targetUserId,
    });

    if (existingSwipe) {
      return res.status(409).json({
        success: false,
        message: "You have already swiped on this user",
      });
    }

    const swipe = await Swipe.create({
      swiper: swiperId,
      target: targetUserId,
      action,
    });

    let isMatch = false;
    let match = null;

    if (action === "like") {
      const reverseLike = await Swipe.findOne({
        swiper: targetUserId,
        target: swiperId,
        action: "like",
      });

      if (reverseLike) {
        const existingMatch = await Match.findOne({
          users: { $all: [swiperId, targetUserId] },
          status: "active",
        });

        if (!existingMatch) {
          match = await Match.create({
            users: [swiperId, targetUserId],
            status: "active",
          });

          await createNotification({
            user: swiperId,
            type: "match",
            title: "New Match",
            message: "You have a new match!",
            relatedUser: targetUserId,
            relatedMatch: match._id,
          });

          await createNotification({
            user: targetUserId,
            type: "match",
            title: "New Match",
            message: "You have a new match!",
            relatedUser: swiperId,
            relatedMatch: match._id,
          });
        } else {
          match = existingMatch;
        }

        isMatch = true;
      }
    }

    return res.status(201).json({
      success: true,
      message: isMatch ? "It's a match!" : "Swipe saved successfully",
      data: {
        swipe,
        isMatch,
        match,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already swiped on this user",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Swipe failed",
      error: error.message,
    });
  }
};

// GET MY SWIPE HISTORY
export const getMySwipeHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const swipes = await Swipe.find({
      swiper: userId,
    })
      .populate(
        "target",
        "name email age gender bio city country profilePhoto relationshipGoal"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Swipe history fetched successfully",
      count: swipes.length,
      data: swipes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch swipe history",
      error: error.message,
    });
  }
};

// GET USERS I LIKED
export const getMyLikedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const likedUsers = await Swipe.find({
      swiper: userId,
      action: "like",
    })
      .populate(
        "target",
        "name age gender bio city country profilePhoto relationshipGoal"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Liked users fetched successfully",
      count: likedUsers.length,
      data: likedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch liked users",
      error: error.message,
    });
  }
};

// GET USERS WHO LIKED ME
export const getUsersWhoLikedMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const usersWhoLikedMe = await Swipe.find({
      target: userId,
      action: "like",
    })
      .populate(
        "swiper",
        "name age gender bio city country profilePhoto relationshipGoal"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users who liked you fetched successfully",
      count: usersWhoLikedMe.length,
      data: usersWhoLikedMe,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users who liked you",
      error: error.message,
    });
  }
};

// DELETE / UNDO SWIPE
export const undoSwipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target user ID",
      });
    }

    const swipe = await Swipe.findOneAndDelete({
      swiper: userId,
      target: targetUserId,
    });

    if (!swipe) {
      return res.status(404).json({
        success: false,
        message: "Swipe not found",
      });
    }

    if (swipe.action === "like") {
      await Match.findOneAndUpdate(
        {
          users: { $all: [userId, targetUserId] },
          status: "active",
        },
        {
          status: "unmatched",
          unmatchedBy: userId,
          unmatchedAt: new Date(),
        },
        {
          returnDocument: "after",
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Swipe undone successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to undo swipe",
      error: error.message,
    });
  }
};