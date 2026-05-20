import express from "express";

import {
  getMyChats,
  getMessagesByMatch,
  sendMessage,
  markMessageAsRead,
  markChatAsRead,
  deleteMessage,
} from "../controller/chatController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMyChats);

router.get("/:matchId/messages", authMiddleware, getMessagesByMatch);

router.post("/:matchId/messages", authMiddleware, sendMessage);

router.patch("/messages/:messageId/read", authMiddleware, markMessageAsRead);

router.patch("/:matchId/read", authMiddleware, markChatAsRead);

router.delete("/messages/:messageId", authMiddleware, deleteMessage);

export default router;