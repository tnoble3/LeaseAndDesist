import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
  },
  avatarUrl: {
    type: String,
    trim: true,
    default: "",
  },
  name: {
    type: String,
    trim: true,
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Keep composite name in sync and hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("firstName") || this.isModified("lastName") || this.isNew) {
    const first = this.firstName?.trim() || "";
    const last = this.lastName?.trim() || "";
    this.name = `${first} ${last}`.trim();
  }

  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);
export default User;
