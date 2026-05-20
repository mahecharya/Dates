import express from "express";

import {
  createSwipe,
  getMySwipeHistory,
  getMyLikedUsers,
  getUsersWhoLikedMe,
  undoSwipe,
} from "../controller/swipeController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createSwipe);

router.get("/history", authMiddleware, getMySwipeHistory);
router.get("/liked", authMiddleware, getMyLikedUsers);
router.get("/liked-me", authMiddleware, getUsersWhoLikedMe);

router.delete("/:targetUserId", authMiddleware, undoSwipe);

export default router;