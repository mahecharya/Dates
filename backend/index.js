import express from "express";
import dotenv from "dotenv";
import cors from "cors";

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

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});