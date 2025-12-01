import mongoose from "mongoose";

const aiFeedbackSchema = new mongoose.Schema(
  {
    submissionId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    prompt: { type: String, required: true },
    response: { type: mongoose.Schema.Types.Mixed, required: true },
    source: { type: String, default: "openai" }
  },
  { timestamps: true }
);

const AIFeedback = mongoose.model("AIFeedback", aiFeedbackSchema);
export default AIFeedback;
