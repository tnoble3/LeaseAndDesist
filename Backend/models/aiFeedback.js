import mongoose from "mongoose";

const aiFeedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    submissionId: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    fileName: { type: String, default: "" },
    content: { type: String, required: true },
    provider: { type: String, default: "template" },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    status: { type: String, default: "success" },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

const AiFeedback = mongoose.model("AiFeedback", aiFeedbackSchema);
export default AiFeedback;
