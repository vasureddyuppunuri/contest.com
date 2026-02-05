const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
    points: { type: Number, min: 2, max: 10, required: true },
  },
  { _id: false }
);

const peerVoteSchema = new mongoose.Schema(
  {
    voter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 10, required: true },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    githubUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratings: { type: [ratingSchema], default: [] },
    peerVotes: { type: [peerVoteSchema], default: [] },
    submissions: { type: [submissionSchema], default: [] },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    winnerPoints: { type: Number, default: 0 },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
