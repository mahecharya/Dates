import express from "express";

import {
  uploadUserPhoto,
  getMyPhotos,
  setPrimaryPhoto,
  deletePhoto,
  getUserPhotos,
} from "../controller/photoController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadPhoto } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  uploadPhoto.single("photo"),
  uploadUserPhoto
);

router.get("/me", authMiddleware, getMyPhotos);

router.patch(
  "/:photoId/primary",
  authMiddleware,
  setPrimaryPhoto
);

router.delete(
  "/:photoId",
  authMiddleware,
  deletePhoto
);

router.get(
  "/user/:userId",
  authMiddleware,
  getUserPhotos
);

export default router;