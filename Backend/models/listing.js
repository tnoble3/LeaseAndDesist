import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  location: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
