import express from "express";

import {
  getAllReports,
  getReportByIdForAdmin,
  updateReportStatus,
  banReportedUser,
  getReportedUsersSummary,
} from "../controller/adminReportController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/reports", authMiddleware, adminMiddleware, getAllReports);
router.get("/reports/:reportId", authMiddleware, adminMiddleware, getReportByIdForAdmin);
router.patch("/reports/:reportId/status", authMiddleware, adminMiddleware, updateReportStatus);
router.patch("/reports/:reportId/ban-user", authMiddleware, adminMiddleware, banReportedUser);
router.get("/reported-users", authMiddleware, adminMiddleware, getReportedUsersSummary);

export default router;