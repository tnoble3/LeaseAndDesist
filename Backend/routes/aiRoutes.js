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
    const clean = (value) => value?.toString().trim() || "";

    const requestGoalId = clean(req.body?.goalId);
    const providedFocus = clean(req.body?.focus);
    const providedOccasion = clean(req.body?.occasion);

    if (providedOccasion.length > 80) {
      return res.status(400).json({ message: "Occasion is too long." });
    }

    let goalTitle = "";
    let goalId = null;

    if (requestGoalId) {
      if (!isValidObjectId(requestGoalId)) {
        return res.status(400).json({ message: "Invalid goal id." });
      }

      const goal = await Goal.findOne({ _id: requestGoalId, user: req.userId }).lean();
      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }

      goalTitle = goal.title;
      goalId = goal._id;
    }

    const subject = goalTitle || providedFocus || "community connection";
    const focusForPrompt = providedFocus || goalTitle || subject;

    const { challenge, prompt, provider } = await generateChallenge({
      goalTitle: subject,
      focus: focusForPrompt,
      occasion: providedOccasion,
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

    const occasionValue = challenge.occasion || providedOccasion || undefined;
    const responseFocus = providedFocus || goalTitle || undefined;

    res.json({
      ...challenge,
      goalId: goalId || null,
      focus: responseFocus,
      occasion: occasionValue,
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
