import express from "express";
import mongoose from "mongoose";
import Goal from "../models/goal.js";
import Challenge from "../models/challenge.js";
import Rsvp from "../models/rsvp.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const calculateProgress = async (goalId, userId) => {
  const [totalChallenges, completedChallenges] = await Promise.all([
    Challenge.countDocuments({ goal: goalId, user: userId }),
    Challenge.countDocuments({ goal: goalId, user: userId, status: "done" }),
  ]);

  const percentage =
    totalChallenges === 0
      ? 0
      : Math.round((completedChallenges / totalChallenges) * 100);

  return {
    total: totalChallenges,
    completed: completedChallenges,
    percentage,
  };
};

router.post("/", async (req, res) => {
  try {
    const { title, description, targetDate } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required." });
    }

    const goal = await Goal.create({
      title: title.trim(),
      description: description?.trim() || "",
      targetDate: targetDate ? new Date(targetDate) : undefined,
      user: req.userId,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({
      message: "Unable to create goal.",
      error: error.message || error,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(goals);
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch goals.",
      error: error.message || error,
    });
  }
});

router.get("/:goalId", async (req, res) => {
  const { goalId } = req.params;

  if (!isValidObjectId(goalId)) {
    return res.status(400).json({ message: "Invalid goal id." });
  }

  try {
    const goal = await Goal.findById(goalId).lean();

    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    return res.json({
      ...goal,
      challengeStats: await calculateProgress(goalId, goal.user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch goal.",
      error: error.message || error,
    });
  }
});

router.patch("/:goalId", async (req, res) => {
  const { goalId } = req.params;
  if (!isValidObjectId(goalId)) {
    return res.status(400).json({ message: "Invalid goal id." });
  }

  const allowedStatus = ["not_started", "in_progress", "completed"];
  const updates = {};
  const { title, description, targetDate, status } = req.body;

  if (typeof title !== "undefined") {
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Title cannot be empty." });
    }
    updates.title = title.trim();
  }

  if (typeof description !== "undefined") {
    updates.description = description?.trim() || "";
  }

  if (typeof targetDate !== "undefined") {
    updates.targetDate = targetDate ? new Date(targetDate) : undefined;
  }

  if (typeof status !== "undefined") {
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    updates.status = status;
  }

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    const isOwner = goal.user?.toString() === req.userId;
    const isStatusOnlyUpdate = Object.keys(updates).length === 1 && updates.status;
    if (!isOwner && !isStatusOnlyUpdate) {
      return res.status(403).json({ message: "Only the creator can edit this goal." });
    }

    Object.assign(goal, updates);
    await goal.save();

    const progress = await calculateProgress(goal._id, req.userId);

    res.json({
      ...goal.toObject(),
      challengeStats: progress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update goal.",
      error: error.message || error,
    });
  }
});

router.delete("/:goalId", async (req, res) => {
  const { goalId } = req.params;
  if (!isValidObjectId(goalId)) {
    return res.status(400).json({ message: "Invalid goal id." });
  }

  try {
    const goal = await Goal.findOne({ _id: goalId, user: req.userId });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    const goalChallenges = await Challenge.find({ goal: goalId, user: req.userId }).select(
      "_id"
    );
    const challengeIds = goalChallenges.map((c) => c._id);

    await Promise.all([
      goal.deleteOne(),
      Challenge.deleteMany({ goal: goalId, user: req.userId }),
      Rsvp.deleteMany({ challenge: { $in: challengeIds } }),
    ]);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete goal.",
      error: error.message || error,
    });
  }
});

router.get("/:goalId/progress", async (req, res) => {
  const { goalId } = req.params;
  if (!isValidObjectId(goalId)) {
    return res.status(400).json({ message: "Invalid goal id." });
  }

  const goal = await Goal.findById(goalId);
  if (!goal) {
    return res.status(404).json({ message: "Goal not found." });
  }

  try {
    const progress = await calculateProgress(goalId, goal.user);
    res.json(progress);
  } catch (error) {
    res.status(500).json({
      message: "Unable to calculate progress.",
      error: error.message || error,
    });
  }
});

export default router;
