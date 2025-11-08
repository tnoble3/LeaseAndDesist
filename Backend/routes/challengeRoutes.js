import express from "express";
import Challenge from "../models/challenge.js";
import { auth } from "../middleware/auth.js";
import { body, validationResult } from 'express-validator'

const router = express.Router();

// Get all challenges (optionally filter by owner via query ?owner=)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.owner) filter.owner = req.query.owner;
    const challenges = await Challenge.find(filter).populate("owner", "name email");
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Error fetching challenges", error: error.message });
  }
});

// Get single challenge
router.get("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate("owner", "name email");
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Error fetching challenge", error: error.message });
  }
});

// Create challenge (protected)
router.post(
  "/",
  auth,
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('target_date').optional().isISO8601().withMessage('target_date must be a valid date'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    try {
      const { title, description, target_date } = req.body;
      const newChallenge = new Challenge({
        title,
        description,
        target_date,
        owner: req.userId
      });
      await newChallenge.save();
      const populated = await newChallenge.populate("owner", "name email");
      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ message: "Error creating challenge", error: error.message });
    }
  }
);

// Update challenge (protected, owner only)
router.patch(
  "/:id",
  auth,
  body('title').optional().isString().trim().notEmpty().withMessage('Title must be a string'),
  body('target_date').optional().isISO8601().withMessage('target_date must be a valid date'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    try {
      const challenge = await Challenge.findById(req.params.id);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      if (challenge.owner.toString() !== req.userId) {
        return res.status(403).json({ message: "Not authorized to modify this challenge" });
      }

      // apply allowed updates
      const allowed = ["title", "description", "target_date", "completed"];
      allowed.forEach((field) => {
        if (field in req.body) challenge[field] = req.body[field];
      });

      await challenge.save();
      const populated = await challenge.populate("owner", "name email");
      res.json(populated);
    } catch (error) {
      res.status(500).json({ message: "Error updating challenge", error: error.message });
    }
  }
);

// Delete challenge (protected, owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    if (challenge.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this challenge" });
    }
    await challenge.deleteOne();
    res.json({ message: "Challenge deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting challenge", error: error.message });
  }
});

export default router;
