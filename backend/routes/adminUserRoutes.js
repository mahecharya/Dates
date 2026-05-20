import express from "express";

import {
  getAllUsers,
  getUserByIdForAdmin,
  banUser,
  unbanUser,
  updateUserRole,
  deleteUserByAdmin,
  getAdminStats,
} from "../controller/adminUserContorller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, adminMiddleware, getAdminStats);

router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

router.get("/users/:userId", authMiddleware, adminMiddleware, getUserByIdForAdmin);

router.patch("/users/:userId/ban", authMiddleware, adminMiddleware, banUser);

router.patch("/users/:userId/unban", authMiddleware, adminMiddleware, unbanUser);

router.patch("/users/:userId/role", authMiddleware, adminMiddleware, updateUserRole);

router.delete("/users/:userId", authMiddleware, adminMiddleware, deleteUserByAdmin);

export default router;