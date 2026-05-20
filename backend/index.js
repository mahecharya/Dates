import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDb from "./config/config.js";

import userRoutes from "./routes/userRoutes.js";
import preferenceRoutes from "./routes/preferenceRoute.js";
import photoRoutes from "./routes/photoRoutes.js";
import discoveryRoutes from "./routes/discoveryRoutes.js";
import swipeRoutes from "./routes/swipeRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import blockRoutes from "./routes/blockRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

dotenv.config();

connectDb();

const app = express();

// Needed for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is running",
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/swipes", swipeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

// Admin routes
app.use("/api/admin", adminReportRoutes);
app.use("/api/admin", adminUserRoutes);

// 404 route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});