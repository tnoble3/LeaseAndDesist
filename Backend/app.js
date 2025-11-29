import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/challenges", challengeRoutes);

export default app;
