const User = require("../models/User");

const getLeaderboard = async (_req, res) => {
  const users = await User.find({ role: "participant" })
    .sort({ totalPoints: -1, streak: -1, name: 1 })
    .lean();

  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    id: user._id,
    name: user.name,
    latestRating: user.latestRating,
    totalPoints: user.totalPoints,
    streak: user.streak,
  }));

  return res.json(leaderboard);
};

module.exports = { getLeaderboard };
