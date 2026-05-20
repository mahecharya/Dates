import express from "express";

import {
  blockUser,
  getMyBlockedUsers,
  checkBlockStatus,
  unblockUser,
} from "../controller/blockController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, blockUser);

router.get("/", authMiddleware, getMyBlockedUsers);

router.get("/status/:otherUserId", authMiddleware, checkBlockStatus);

router.delete("/:blockedUserId", authMiddleware, unblockUser);

export default router;