import mongoose from "mongoose";
import Match from "../model/matchModel.js";

// GET MY MATCHES
export const getMyMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await Match.find({
      users: userId,
      status: "active",
    })
      .populate(
        "users",
        "name email age gender bio city country profilePhoto relationshipGoal isProfileComplete"
      )
      .sort({ createdAt: -1 });

    const formattedMatches = matches.map((match) => {
      const otherUser = match.users.find(
        (user) => user._id.toString() !== userId.toString()
      );

      return {
        matchId: match._id,
        status: match.status,
        matchedAt: match.createdAt,
        otherUser,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Matches fetched successfully",
      count: formattedMatches.length,
      data: formattedMatches,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch matches",
      error: error.message,
    });
  }
};

// GET SINGLE MATCH DETAIL
export const getMatchById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    const match = await Match.findOne({
      _id: matchId,
      users: userId,
      status: "active",
    }).populate(
      "users",
      "name email age gender bio city country profilePhoto relationshipGoal"
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    const otherUser = match.users.find(
      (user) => user._id.toString() !== userId.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Match fetched successfully",
      data: {
        matchId: match._id,
        status: match.status,
        matchedAt: match.createdAt,
        otherUser,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch match",
      error: error.message,
    });
  }
};

// UNMATCH USER
export const unmatchUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    const match = await Match.findOne({
      _id: matchId,
      users: userId,
      status: "active",
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Active match not found",
      });
    }

    match.status = "unmatched";
    match.unmatchedBy = userId;
    match.unmatchedAt = new Date();

    await match.save();

    return res.status(200).json({
      success: true,
      message: "User unmatched successfully",
      data: match,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unmatch user",
      error: error.message,
    });
  }
};