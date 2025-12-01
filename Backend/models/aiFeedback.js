import mongoose from "mongoose";

const aiFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissionType: {
      type: String,
      enum: ["text", "file"],
      required: true,
    },
    submissionContent: {
      type: String,
      required: true,
    },
    submissionFileName: {
      type: String,
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const AIFeedback = mongoose.model("AIFeedback", aiFeedbackSchema);
export default AIFeedback;
