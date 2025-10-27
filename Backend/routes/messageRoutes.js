import express from "express";
import Message from "../models/message.js";
const router = express.Router();

// Get all messages
router.get("/", async (req, res) => {
  const messages = await Message.find().populate("sender receiver");
  res.json(messages);
});

// Send a message
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);
  await newMessage.save();
  res.status(201).json(newMessage);
});

export default router;
