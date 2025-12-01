import mongoose from "mongoose";

const aiLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    provider: { type: String, default: "template" },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    status: { type: String, default: "success" },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

const AiLog = mongoose.model("AiLog", aiLogSchema);
export default AiLog;
