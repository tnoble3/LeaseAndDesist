import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  target_date: { type: Date },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Challenge = mongoose.model("Challenge", challengeSchema);
export default Challenge;
