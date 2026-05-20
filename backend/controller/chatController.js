import mongoose from "mongoose";
import Match from "../model/matchModel.js";
import Message from "../model/messageModel.js";
import Block from "../model/blockModel.js";
import { createNotification } from "../utils/createNotification.js";

// GET ALL CHATS / ACTIVE MATCHES FOR CURRENT USER
export const getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Match.find({
      users: userId,
      status: "active",
    })
      .populate(
        "users",
        "name email age gender bio city country profilePhoto relationshipGoal"
      )
      .sort({ updatedAt: -1 });

    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const otherUser = chat.users.find(
          (user) => user._id.toString() !== userId.toString()
        );

        const lastMessage = await Message.findOne({
          match: chat._id,
          isDeleted: false,
        })
          .sort({ createdAt: -1 })
          .populate("sender", "name profilePhoto")
          .populate("receiver", "name profilePhoto");

        const unreadCount = await Message.countDocuments({
          match: chat._id,
          receiver: userId,
          isRead: false,
          isDeleted: false,
        });

        return {
          matchId: chat._id,
          status: chat.status,
          matchedAt: chat.createdAt,
          otherUser,
          lastMessage,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Chats fetched successfully",
      count: formattedChats.length,
      data: formattedChats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message,
    });
  }
};

// GET MESSAGES BY MATCH ID
export const getMessagesByMatch = async (req, res) => {
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
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this chat",
      });
    }

    const messages = await Message.find({
      match: matchId,
      isDeleted: false,
    })
      .populate("sender", "name profilePhoto")
      .populate("receiver", "name profilePhoto")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { matchId } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be more than 1000 characters",
      });
    }

    const match = await Match.findOne({
      _id: matchId,
      users: senderId,
      status: "active",
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to send message in this chat",
      });
    }

    const receiverId = match.users.find(
      (user) => user.toString() !== senderId.toString()
    );

    const blockExists = await Block.findOne({
      $or: [
        { blocker: senderId, blocked: receiverId },
        { blocker: receiverId, blocked: senderId },
      ],
    });

    if (blockExists) {
      return res.status(403).json({
        success: false,
        message:
          "Message cannot be sent because one of you has blocked the other",
      });
    }

    const newMessage = await Message.create({
      match: matchId,
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name profilePhoto")
      .populate("receiver", "name profilePhoto");

    await createNotification({
      user: receiverId,
      type: "message",
      title: "New Message",
      message: "You received a new message.",
      relatedUser: senderId,
      relatedMatch: matchId,
      relatedMessage: newMessage._id,
    });

    match.updatedAt = new Date();
    await match.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// MARK MESSAGE AS READ
export const markMessageAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiver: userId,
        isDeleted: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you are not the receiver",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
      error: error.message,
    });
  }
};

// MARK ALL MESSAGES IN MATCH AS READ
export const markChatAsRead = async (req, res) => {
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
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this chat",
      });
    }

    await Message.updateMany(
      {
        match: matchId,
        receiver: userId,
        isRead: false,
        isDeleted: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      message: "Chat messages marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark chat as read",
      error: error.message,
    });
  }
};

// SOFT DELETE MESSAGE
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        sender: userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you are not the sender",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};