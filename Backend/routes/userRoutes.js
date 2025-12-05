import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const buildUserResponse = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  email: user.email,
  name: user.name,
  avatarUrl: user.avatarUrl || "",
});

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, confirmPassword } =
      req.body;

    if (!firstName || !lastName || !username || !password) {
      return res
        .status(400)
        .json({ message: "First name, last name, username, and password are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already in use." });
    }

    let normalizedEmail;
    if (email) {
      normalizedEmail = email.trim().toLowerCase();
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use." });
      }
    }

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      avatarUrl: req.body?.avatarUrl?.trim() || "",
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "Login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
});

// Get all users (protected route)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// Get current user profile (protected route)
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
});

router.patch("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, username, email, avatarUrl } = req.body || {};

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof firstName !== "undefined") {
      user.firstName = firstName.toString().trim();
    }
    if (typeof lastName !== "undefined") {
      user.lastName = lastName.toString().trim();
    }

    if (typeof username !== "undefined") {
      const normalizedUsername = username.toString().trim().toLowerCase();
      if (!normalizedUsername) {
        return res.status(400).json({ message: "Username cannot be empty." });
      }
      const existing = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: user._id },
      });
      if (existing) {
        return res.status(400).json({ message: "Username already in use." });
      }
      user.username = normalizedUsername;
    }

    if (typeof email !== "undefined") {
      const normalizedEmail = email?.toString().trim().toLowerCase() || "";
      if (normalizedEmail.length) {
        const existingEmail = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });
        if (existingEmail) {
          return res.status(400).json({ message: "Email already in use." });
        }
        user.email = normalizedEmail;
      } else {
        user.email = undefined;
      }
    }

    if (typeof avatarUrl !== "undefined") {
      user.avatarUrl = avatarUrl?.toString().trim() || "";
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
});

export default router;
