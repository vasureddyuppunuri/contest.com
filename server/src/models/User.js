const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: "default" },
    role: { type: String, enum: ["admin", "participant"], default: "participant" },
    totalPoints: { type: Number, default: 0 },
    totalVotesReceived: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    latestRating: { type: Number, default: 0 },
    lastParticipatedProjectEndDate: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

module.exports = mongoose.model("User", userSchema);
