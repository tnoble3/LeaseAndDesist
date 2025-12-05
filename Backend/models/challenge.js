import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    targetDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: false,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // AI-generated challenge tracking
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    aiProvider: {
      type: String,
      default: "",
      enum: ["", "openai", "openai:fallback", "template"],
    },
    aiLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiLog",
    },
  },
  {
    timestamps: true,
  }
);

challengeSchema.pre("save", function handleStatusChange(next) {
  if (this.isModified("status")) {
    if (this.status === "done" && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status !== "done") {
      this.completedAt = undefined;
    }
  }
  next();
});

const Challenge = mongoose.model("Challenge", challengeSchema);
export default Challenge;
