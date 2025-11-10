import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth.js';
const prisma = new PrismaClient();
const router = express.Router();

// Create challenge (linked to a goal)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, goalId } = req.body;
    const challenge = await prisma.challenge.create({
      data: { title, description, goalId: Number(goalId) }
    });
    res.status(201).json(challenge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get challenges for a goal
router.get('/goal/:goalId', auth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const challenges = await prisma.challenge.findMany({ where: { goalId: Number(goalId) } });
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update (mark complete / edit)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isComplete } = req.body;
    const updated = await prisma.challenge.update({
      where: { id: Number(id) },
      data: { title, description, isComplete }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.challenge.delete({ where: { id: Number(id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
