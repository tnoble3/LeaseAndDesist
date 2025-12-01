import express from "express";
import mongoose from "mongoose";
import Goal from "../models/goal.js";
import AiLog from "../models/aiLog.js";
import AiFeedback from "../models/aiFeedback.js";
import { auth } from "../middleware/auth.js";
import { generateChallenge } from "../services/aiChallengeService.js";
import { generateFeedback } from "../services/aiFeedbackService.js";

const router = express.Router();

router.use(auth);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

router.post("/generateChallenge", async (req, res) => {
  try {
    const { goalId, focus } = req.body || {};
    const providedFocus = focus?.toString().trim() || "";
    let subject = providedFocus;
    let goalTitle = "";

    if (goalId) {
      if (!isValidObjectId(goalId)) {
        return res.status(400).json({ message: "Invalid goal id." });
      }

      const goal = await Goal.findOne({ _id: goalId, user: req.userId }).lean();
      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }

      goalTitle = goal.title;
      if (!subject) {
        subject = goal.title;
      }
    }

    const { challenge, prompt, provider } = await generateChallenge({
      goalTitle: goalTitle || subject,
      focus: providedFocus || goalTitle || subject,
    });

    try {
      await AiLog.create({
        user: req.userId,
        goal: goalId || undefined,
        provider,
        prompt,
        response: JSON.stringify(challenge),
        status: "success",
      });
    } catch (error) {
      console.warn("Unable to persist AI log", error?.message || error);
    }

    res.json({
      ...challenge,
      goalId: goalId || null,
      focus: subject || undefined,
      provider,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to generate a challenge right now.",
    });
  }
});

router.post("/submitForFeedback", async (req, res) => {
  try {
    const { goalId, content, fileName } = req.body || {};

    if (!content || content.toString().trim().length === 0) {
      return res.status(400).json({ message: "Content is required." });
    }

    if (goalId && !isValidObjectId(goalId)) {
      return res.status(400).json({ message: "Invalid goal id." });
    }

    let goalTitle = "";
    if (goalId) {
      const goal = await Goal.findOne({ _id: goalId, user: req.userId }).lean();
      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }
      goalTitle = goal.title;
    }

    const { feedback, prompt, provider } = await generateFeedback({
      goalTitle,
      summary: content,
    });

    const submissionId = new mongoose.Types.ObjectId().toString();

    try {
      await AiFeedback.create({
        user: req.userId,
        goal: goalId || undefined,
        submissionId,
        fileName: fileName || "",
        content: content.toString(),
        provider,
        prompt,
        response: feedback,
        status: "success",
      });
    } catch (error) {
      console.warn("Unable to persist AI feedback log", error?.message || error);
    }

    res.json({
      feedback,
      provider,
      goalId: goalId || null,
      fileName: fileName || "",
      submissionId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to submit for feedback right now.",
    });
  }
});

export default router;
