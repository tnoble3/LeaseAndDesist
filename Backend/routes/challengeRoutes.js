import express from "express";
import mongoose from "mongoose";
import Challenge from "../models/challenge.js";
import Goal from "../models/goal.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const ensureGoalOwnership = async (goalId, userId) => {
  if (!isValidObjectId(goalId)) {
    const error = new Error("Invalid goal id.");
    error.status = 400;
    throw error;
  }

  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) {
    const error = new Error("Goal not found.");
    error.status = 404;
    throw error;
  }

  return goal;
};

const allowedStatus = ["todo", "in_progress", "done"];

router.post("/", async (req, res) => {
  try {
    const { title, description, targetDate, status, goalId } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required." });
    }

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    if (!goalId) {
      return res.status(400).json({ message: "goalId is required." });
    }

    await ensureGoalOwnership(goalId, req.userId);

    const challenge = await Challenge.create({
      title: title.trim(),
      description: description?.trim() || "",
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status,
      goal: goalId,
      user: req.userId,
    });

    res.status(201).json(challenge);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "Unable to create challenge.",
    });
  }
});

router.get("/", async (req, res) => {
  const { goalId, status, limit } = req.query;
  const filter = { user: req.userId };

  if (goalId) {
    if (!isValidObjectId(goalId)) {
      return res.status(400).json({ message: "Invalid goal id." });
    }
    filter.goal = goalId;
  }

  if (status) {
    filter.status = status;
  }

  try {
    let query = Challenge.find(filter).sort({ createdAt: -1 }).lean();

    if (limit) {
      const numericLimit = Math.min(parseInt(limit, 10) || 0, 50);
      if (numericLimit > 0) {
        query = query.limit(numericLimit);
      }
    }

    const challenges = await query;
    res.json(challenges);
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch challenges.",
      error: error.message || error,
    });
  }
});

router.get("/:challengeId", async (req, res) => {
  const { challengeId } = req.params;
  if (!isValidObjectId(challengeId)) {
    return res.status(400).json({ message: "Invalid challenge id." });
  }

  try {
    const challenge = await Challenge.findOne({
      _id: challengeId,
      user: req.userId,
    }).lean();

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch challenge.",
      error: error.message || error,
    });
  }
});

router.patch("/:challengeId", async (req, res) => {
  const { challengeId } = req.params;
  if (!isValidObjectId(challengeId)) {
    return res.status(400).json({ message: "Invalid challenge id." });
  }

  const { title, description, targetDate, status } = req.body;

  if (typeof status !== "undefined" && !allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const challenge = await Challenge.findOne({
      _id: challengeId,
      user: req.userId,
    });

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    if (typeof title !== "undefined") {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: "Title cannot be empty." });
      }
      challenge.title = title.trim();
    }

    if (typeof description !== "undefined") {
      challenge.description = description?.trim() || "";
    }

    if (typeof targetDate !== "undefined") {
      challenge.targetDate = targetDate ? new Date(targetDate) : undefined;
    }

    if (typeof status !== "undefined") {
      challenge.status = status;
    }

    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({
      message: "Unable to update challenge.",
      error: error.message || error,
    });
  }
});

router.delete("/:challengeId", async (req, res) => {
  const { challengeId } = req.params;
  if (!isValidObjectId(challengeId)) {
    return res.status(400).json({ message: "Invalid challenge id." });
  }

  try {
    const challenge = await Challenge.findOne({
      _id: challengeId,
      user: req.userId,
    });

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    await challenge.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete challenge.",
      error: error.message || error,
    });
  }
});

export default router;
