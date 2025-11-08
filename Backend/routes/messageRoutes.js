import express from "express";
import Message from "../models/message.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

// Get all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().populate("sender receiver");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// Send a message (protected)
router.post("/", auth, async (req, res) => {
  try {
    const payload = { ...req.body, sender: req.userId };
    const newMessage = new Message(payload);
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
});

export default router;
