import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  updateCurrentUser,
  updateEmail,
  changePassword,
  logoutUser,
  deleteCurrentUser,
} from "../controller/userController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", authMiddleware, getCurrentUser);

// Important: this must come before /:userId
router.get("/username/:username", authMiddleware, getUserByUsername);

router.get("/:userId", authMiddleware, getUserById);

router.put("/me", authMiddleware, updateCurrentUser);
router.patch("/email", authMiddleware, updateEmail);
router.patch("/password", authMiddleware, changePassword);

router.post("/logout", authMiddleware, logoutUser);
router.delete("/me", authMiddleware, deleteCurrentUser);

export default router;