import express from "express";
import { discoverUsers } from "../controller/discoveryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, discoverUsers);

export default router;