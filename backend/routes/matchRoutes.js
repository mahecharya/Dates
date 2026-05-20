import express from "express";

import {
  getMyMatches,
  getMatchById,
  unmatchUser,
} from "../controller/matchController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMyMatches);
router.get("/:matchId", authMiddleware, getMatchById);
router.delete("/:matchId", authMiddleware, unmatchUser);

export default router;