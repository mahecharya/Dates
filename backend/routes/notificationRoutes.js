import express from "express";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllMyNotifications,
} from "../controller/notificationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);

router.get("/unread-count", authMiddleware, getUnreadNotificationCount);

router.patch("/read-all", authMiddleware, markAllNotificationsAsRead);

router.patch("/:notificationId/read", authMiddleware, markNotificationAsRead);

router.delete("/delete-all", authMiddleware, deleteAllMyNotifications);

router.delete("/:notificationId", authMiddleware, deleteNotification);

export default router;