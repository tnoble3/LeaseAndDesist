import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";

dotenv.config();

const app = express();

const sentryDsn = process.env.SENTRY_DSN;
const sentryEnabled = Boolean(sentryDsn);

if (sentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
  });

  app.use(Sentry.Handlers.requestHandler());
}

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
import aiRoutes from "./routes/aiRoutes.js";

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/ai", aiRoutes);

if (sentryEnabled) {
  app.get("/api/debug-sentry", () => {
    throw new Error("Sentry backend test error");
  });
}

if (sentryEnabled) {
  app.use(Sentry.Handlers.errorHandler());
}

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

export default app;
