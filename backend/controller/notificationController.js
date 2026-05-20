import mongoose from "mongoose";
import Notification from "../model/notificationModel.js";

// GET MY NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const { isRead, type } = req.query;

    const query = {
      user: userId,
    };

    if (isRead === "true") {
      query.isRead = true;
    }

    if (isRead === "false") {
      query.isRead = false;
    }

    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate("relatedUser", "name email profilePhoto age gender")
      .populate("relatedMatch")
      .populate("relatedMessage")
      .populate("relatedReport")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// GET UNREAD NOTIFICATION COUNT
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Unread notification count fetched successfully",
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count",
      error: error.message,
    });
  }
};

// MARK ONE NOTIFICATION AS READ
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// MARK ALL NOTIFICATIONS AS READ
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// DELETE ONE NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// DELETE ALL MY NOTIFICATIONS
export const deleteAllMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({
      user: userId,
    });

    return res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete notifications",
      error: error.message,
    });
  }
};