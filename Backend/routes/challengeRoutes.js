import express from 'express';
import Challenge from '../models/challenge.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get challenges for current user (optionally filter by goal)
router.get('/', auth, async (req, res) => {
  try {
    const filter = { owner: req.userId };
    if (req.query.goalId) filter.goal = req.query.goalId;
    const challenges = await Challenge.find(filter).populate('goal');
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenges', error: error.message });
  }
});

// Create a challenge
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, goal, targetDate } = req.body;
    const challenge = new Challenge({ title, description, owner: req.userId, goal, targetDate });
    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error creating challenge', error: error.message });
  }
});

// Update challenge
router.put('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      req.body,
      { new: true }
    );
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error updating challenge', error: error.message });
  }
});

// Delete challenge
router.delete('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json({ message: 'Challenge deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting challenge', error: error.message });
  }
});

// Mark complete / toggle
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, owner: req.userId });
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    challenge.completed = !!req.body.completed;
    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error updating completion', error: error.message });
  }
});

export default router;
