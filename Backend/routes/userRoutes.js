import express from "express";
import User from "../models/user.js";
const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Add a user
router.post("/", async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.status(201).json(newUser);
});

export default router;
