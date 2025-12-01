import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const DEFAULT_DB_NAME = process.env.MONGO_DB || "leaseanddesist";
const FALLBACK_URI =
  process.env.MONGO_FALLBACK_URI ||
  `mongodb://${process.env.MONGO_HOST || "127.0.0.1"}:${
    process.env.MONGO_PORT || "27017"
  }/${DEFAULT_DB_NAME}`;

const extractErrorCode = (error) =>
  error?.code ||
  error?.cause?.code ||
  error?.reason?.code ||
  error?.reason?.cause?.code;

const shouldAttemptFallback = (error, attemptedUri) => {
  if (!error || attemptedUri === FALLBACK_URI) {
    return false;
  }

  const fallbackCodes = ["ENOTFOUND", "ECONNREFUSED", "ECONNRESET"];
  const errorCode = extractErrorCode(error);
  const message = error?.message || "";

  if (errorCode && fallbackCodes.includes(errorCode)) {
    return true;
  }

  return fallbackCodes.some((code) => message.includes(code));
};

const connectToDatabase = async () => {
  const configuredUri = process.env.MONGO_URI?.trim();
  const primaryUri =
    configuredUri && configuredUri.length > 0 ? configuredUri : FALLBACK_URI;

  try {
    await mongoose.connect(primaryUri);
    console.log(`✅ MongoDB connected (${primaryUri})`);
    return;
  } catch (error) {
    console.error("MongoDB connection error:", error.message || error);
    if (!shouldAttemptFallback(error, primaryUri)) {
      throw error;
    }
    console.warn(
      `Unable to reach Mongo host defined in MONGO_URI (${primaryUri}). Falling back to ${FALLBACK_URI}.`
    );
  }

  await mongoose.connect(FALLBACK_URI);
  console.log(`✅ MongoDB connected (fallback: ${FALLBACK_URI})`);
};
// Start the server after the database is ready
const PORT = process.env.PORT || 5050;
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error(
      "❌ Unable to start server because MongoDB is unreachable.",
      error
    );
    process.exit(1);
  }
};

startServer();
