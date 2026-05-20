import Notification from "../model/notificationModel.js";

export const createNotification = async ({
  user,
  type,
  title,
  message,
  relatedUser = null,
  relatedMatch = null,
  relatedMessage = null,
  relatedReport = null,
}) => {
  try {
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      relatedUser,
      relatedMatch,
      relatedMessage,
      relatedReport,
    });

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    return null;
  }
};