import mongoose from "mongoose";

const rsvpSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["going", "maybe", "declined"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

rsvpSchema.index({ challenge: 1, user: 1 }, { unique: true });

const Rsvp = mongoose.model("Rsvp", rsvpSchema);
export default Rsvp;
