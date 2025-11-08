import express from "express";
import Listing from "../models/listing.js";
const router = express.Router();

// Get all listings
router.get("/", async (req, res) => {
  const listings = await Listing.find().populate("owner");
  res.json(listings);
});

// Add a listing
router.post("/", async (req, res) => {
  const newListing = new Listing(req.body);
  await newListing.save();
  res.status(201).json(newListing);
});

export default router;
