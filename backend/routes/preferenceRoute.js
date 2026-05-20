import express from "express";

import {
  createPreference,
  getMyPreference,
  updateMyPreference,
  upsertMyPreference,
  deleteMyPreference,
} from "../controller/preferenceController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/", authMiddleware, createPreference);
router.get("/me", authMiddleware, getMyPreference);
router.put("/me", authMiddleware, updateMyPreference);
router.patch("/me", authMiddleware, upsertMyPreference);
router.delete("/me", authMiddleware, deleteMyPreference);

export default router;