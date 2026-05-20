import express from "express";

import {
  createReport,
  getMyReports,
  getMyReportById,
  deleteMyReport,
} from "../controller/reportController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createReport);
router.get("/my", authMiddleware, getMyReports);
router.get("/my/:reportId", authMiddleware, getMyReportById);
router.delete("/my/:reportId", authMiddleware, deleteMyReport);

export default router;