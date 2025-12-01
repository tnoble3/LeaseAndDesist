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
import aiRoutes from "./routes/aiRoutes.js";

// Initialize Sentry for error tracking (skip in test environment)
if (process.env.SENTRY_DSN && process.env.NODE_ENV !== "test") {
  try {
    import("sentry-node").then((sentryModule) => {
      const Sentry = sentryModule;
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: 1.0,
      });
      app.use(Sentry.Handlers.requestHandler());
    });
  } catch (err) {
    console.warn("Sentry initialization skipped:", err.message);
  }
}

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/ai", aiRoutes);

export default app;
