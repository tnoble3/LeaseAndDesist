import express from "express";
import mongoose from "mongoose";
import Challenge from "../models/challenge.js";
import Goal from "../models/goal.js";
import Rsvp from "../models/rsvp.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const allowedRsvpStatuses = ["going", "maybe", "declined"];

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

const buildDefaultRsvpCounts = () => ({
  going: 0,
  maybe: 0,
  declined: 0,
});

const fetchRsvpCounts = async (challengeIds = []) => {
  if (!challengeIds.length) return {};

  const normalizedIds = challengeIds.map((id) =>
    typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
  );

  const counts = await Rsvp.aggregate([
    { $match: { challenge: { $in: normalizedIds } } },
    {
      $group: {
        _id: { challenge: "$challenge", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = {};
  counts.forEach((row) => {
    const challengeId = row._id.challenge.toString();
    const status = row._id.status;
    if (!map[challengeId]) {
      map[challengeId] = buildDefaultRsvpCounts();
    }
    map[challengeId][status] = row.count;
  });

  return map;
};

router.post("/", async (req, res) => {
  try {
    const { title, description, targetDate, status } = req.body;
    const incomingGoalId = req.body.goalId;
    const goalId =
      incomingGoalId && incomingGoalId !== "none"
        ? incomingGoalId
        : null;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required." });
    }

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    if (goalId) {
      await ensureGoalOwnership(goalId, req.userId);
    }

    const challenge = await Challenge.create({
      title: title.trim(),
      description: description?.trim() || "",
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status,
      goal: goalId || undefined,
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
  const filter = {};
  const normalizedGoalId = goalId && goalId !== "none" ? goalId : null;

  if (normalizedGoalId) {
    if (!isValidObjectId(normalizedGoalId)) {
      return res.status(400).json({ message: "Invalid goal id." });
    }
    filter.goal = normalizedGoalId;
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
    const challengeIds = challenges.map((ch) => ch._id?.toString()).filter(Boolean);

    const userRsvps = await Rsvp.find({
      challenge: { $in: challengeIds },
      user: req.userId,
    }).lean();
    const userRsvpMap = new Map(
      userRsvps.map((rsvp) => [rsvp.challenge.toString(), rsvp.status])
    );

    const ownedChallengeIds = challenges
      .filter((ch) => ch.user?.toString() === req.userId)
      .map((ch) => ch._id);
    const rsvpCountsMap = await fetchRsvpCounts(ownedChallengeIds);

    const enriched = challenges.map((ch) => {
      const id = ch._id?.toString();
      return {
        ...ch,
        userRsvp: userRsvpMap.get(id) || null,
        rsvpCounts:
          ch.user?.toString() === req.userId
            ? rsvpCountsMap[id] || buildDefaultRsvpCounts()
            : undefined,
      };
    });

    res.json(enriched);
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
    }).lean();

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    const userRsvpDoc = await Rsvp.findOne({
      challenge: challengeId,
      user: req.userId,
    }).lean();

    const response = {
      ...challenge,
      userRsvp: userRsvpDoc?.status || null,
    };

    if (challenge.user?.toString() === req.userId) {
      const countsMap = await fetchRsvpCounts([challenge._id]);
      response.rsvpCounts = countsMap[challenge._id.toString()] || buildDefaultRsvpCounts();
    }

    res.json(response);
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
    await Rsvp.deleteMany({ challenge: challengeId });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete challenge.",
      error: error.message || error,
    });
  }
});

router.patch("/:challengeId/rsvp", async (req, res) => {
  const { challengeId } = req.params;
  const requestedStatus = req.body?.status;

  if (!isValidObjectId(challengeId)) {
    return res.status(400).json({ message: "Invalid challenge id." });
  }

  const normalizedStatus =
    requestedStatus === "none" ? "none" : requestedStatus?.toString().trim();

  if (normalizedStatus !== "none" && !allowedRsvpStatuses.includes(normalizedStatus)) {
    return res.status(400).json({ message: "Invalid RSVP status." });
  }

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    return res.status(404).json({ message: "Challenge not found." });
  }

  if (normalizedStatus === "none") {
    await Rsvp.deleteOne({ challenge: challengeId, user: req.userId });
  } else {
    await Rsvp.findOneAndUpdate(
      { challenge: challengeId, user: req.userId },
      { status: normalizedStatus },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  let rsvpCounts;
  if (challenge.user?.toString() === req.userId) {
    const countsMap = await fetchRsvpCounts([challengeId]);
    rsvpCounts = countsMap[challengeId] || buildDefaultRsvpCounts();
  }

  res.json({
    message: "RSVP updated",
    status: normalizedStatus === "none" ? null : normalizedStatus,
    rsvpCounts,
  });
});

export default router;
