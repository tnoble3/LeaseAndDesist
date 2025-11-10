import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth.js'; // reuse your JWT middleware
const prisma = new PrismaClient();
const router = express.Router();

// Create goal
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, targetDate } = req.body;
    // get user identifier from req.userId — depends on your auth (Mongo user id). Here we assume numeric Prisma user id.
    const userId = req.userId; 
    const goal = await prisma.goal.create({
      data: { title, description, targetDate: targetDate ? new Date(targetDate) : null, userId: Number(userId) }
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Read user's goals
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const goals = await prisma.goal.findMany({
      where: { userId: Number(userId) },
      include: { challenges: true }
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate } = req.body;
    const updated = await prisma.goal.update({
      where: { id: Number(id) },
      data: { title, description, targetDate: targetDate ? new Date(targetDate) : null }
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
    await prisma.challenge.deleteMany({ where: { goalId: Number(id) } }); // cleanup
    await prisma.goal.delete({ where: { id: Number(id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
