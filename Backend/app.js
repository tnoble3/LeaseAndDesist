import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (if MONGO_URI provided)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn('MONGO_URI not set; DB operations will fail until configured.');
}

// Example root route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Import routes
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/challenges", challengeRoutes);

export default app;
