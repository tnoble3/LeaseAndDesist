import express from "express";
import Listing from "../models/listing.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

// Get all listings
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find().populate("owner");
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings", error: error.message });
  }
});

// Add a listing (protected)
router.post("/", auth, async (req, res) => {
  try {
    const payload = { ...req.body, owner: req.userId };
    const newListing = new Listing(payload);
    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ message: "Error creating listing", error: error.message });
  }
});

// Get single listing
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listing', error: error.message });
  }
});

// Update listing (protected, owner only)
router.patch('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.owner?.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    const allowed = ['title','description','price','location'];
    allowed.forEach(f => { if (f in req.body) listing[f] = req.body[f]; });
    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing', error: error.message });
  }
});

// Delete listing (protected, owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.owner?.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting listing', error: error.message });
  }
});

export default router;
