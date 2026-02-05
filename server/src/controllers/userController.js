const User = require("../models/User");
const Project = require("../models/Project");

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash");
  return res.json(user);
};

const listParticipants = async (_req, res) => {
  const participants = await User.find({ role: "participant" })
    .select("name email totalPoints streak latestRating avatar")
    .sort({ name: 1 })
    .lean();
  
  // Transform _id to id for frontend consistency if needed, but keeping _id for now
  // since most of the frontend uses it. Adding avatar too.
  return res.json(participants);
};

const getGlobalStats = async (req, res) => {
  try {
    const [userCount, projectCount, activeProject] = await Promise.all([
      User.countDocuments({ role: "participant" }),
      Project.countDocuments(),
      Project.findOne({ status: "active" })
    ]);

    return res.json({
      userCount,
      projectCount,
      hasActive: !!activeProject,
      activeTitle: activeProject ? activeProject.title : "None"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, listParticipants, getGlobalStats, deleteUser };
