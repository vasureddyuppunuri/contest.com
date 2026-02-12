const Project = require("../models/Project");
const User = require("../models/User");
const { isConsecutiveWeek } = require("../utils/date");

const createProject = async (req, res) => {
  const { title, description, startDate, endDate } = req.body;
  if (!title || !description || !startDate || !endDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingActive = await Project.findOne({ status: "active" });
  if (existingActive) {
    return res.status(400).json({ message: "An active project already exists" });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ message: "Invalid dates provided" });
  }

  if (start >= end) {
    return res.status(400).json({ message: "End date must be after start date" });
  }

  const project = await Project.create({
    title,
    description,
    startDate,
    endDate,
    createdBy: req.user._id,
  });

  // Fetch all participants to send email
  try {
    const participants = await User.find({ role: "participant" }, "email name");
    const emails = participants.map((p) => p.email).filter(Boolean);

    if (emails.length > 0) {
      const { sendEmail } = require("../utils/email");
      const timeline = `From ${new Date(startDate).toLocaleString()} to ${new Date(endDate).toLocaleString()}`;

      const html = `
        <div style="font-family: sans-serif; background-color: #09090b; color: #ffffff; padding: 40px; border-radius: 20px;">
          <h1 style="color: #10b981; text-transform: uppercase; letter-spacing: 2px;">New Arena Challenge Initiated</h1>
          <p style="font-size: 16px; margin-top: 20px;">The Arena Command has deployed a new project objective:</p>
          <div style="background-color: #18181b; padding: 25px; border-radius: 15px; border: 1px solid #27272a; margin: 20px 0;">
            <h2 style="color: #ffffff; margin-top: 0;">${title}</h2>
            <p style="color: #a1a1aa; font-size: 14px;">${description}</p>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 20px 0;" />
            <p style="font-weight: bold; color: #10b981;">Timeline: <span style="color: #ffffff; font-weight: normal;">${timeline}</span></p>
          </div>
          <p style="font-size: 12px; color: #71717a; margin-top: 30px;">Access the portal at ${process.env.CLIENT_ORIGIN} to begin your mission.</p>
        </div>
      `;

      await sendEmail(emails, `[MISSION START] ${title}`, html, req.user.email, req.user.name);
    }
  } catch (emailErr) {
    console.error("Failed to send initial project emails:", emailErr);
  }

  return res.status(201).json(project);
};

const getActiveProject = async (_req, res) => {
  const project = await Project.findOne({ status: "active" })
    .populate("createdBy", "name")
    .lean();
  const latestWinner = await Project.findOne({ status: "closed", winner: { $ne: null } })
    .sort({ endDate: -1 })
    .populate("winner", "name")
    .lean();

  return res.json({ project, latestWinner });
};

const listProjects = async (_req, res) => {
  const projects = await Project.find()
    .populate("winner", "name")
    .sort({ startDate: -1 })
    .lean();
  return res.json(projects);
};

const closeProject = async (req, res) => {
  const { id } = req.params;
  const { ratings: manualRatings } = req.body;

  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.status !== "active") {
    return res.status(400).json({ message: "Project is already closed" });
  }

  const participants = await User.find({ role: "participant" });
  const finalRatings = [];

  // Calculate peer vote averages
  const voteAggregates = {}; // candidateId -> { totalRating, count }
  project.peerVotes.forEach((pv) => {
    const cid = String(pv.candidate);
    if (!voteAggregates[cid]) voteAggregates[cid] = { sum: 0, count: 0 };
    voteAggregates[cid].sum += pv.rating;
    voteAggregates[cid].count += 1;
  });

  let winner = null;
  let winnerPoints = 0;

  for (const participant of participants) {
    let stars = 0;
    const pId = String(participant._id);

    // Manual admin rating takes precedence if provided accurately
    const manual = manualRatings?.find((r) => String(r.userId) === pId);
    if (manual && manual.stars > 0) {
      stars = manual.stars;
    } else if (voteAggregates[pId]) {
      // Otherwise use normalized peer votes (1-10 scale down to 1-5 stars)
      stars = Math.round(voteAggregates[pId].sum / voteAggregates[pId].count / 2) || 1;
    }

    if (stars > 0) {
      const points = stars * 2;
      finalRatings.push({ user: participant._id, stars, points });

      if (points > winnerPoints) {
        winner = participant._id;
        winnerPoints = points;
      }

      const consecutive = isConsecutiveWeek(
        participant.lastParticipatedProjectEndDate,
        project.startDate
      );
      participant.streak = consecutive ? participant.streak + 1 : 1;
      
      // Update total votes received for this participant
      if (voteAggregates[pId]) {
        participant.totalVotesReceived = (participant.totalVotesReceived || 0) + voteAggregates[pId].count;
      }

      participant.totalPoints += points;
      participant.latestRating = stars;
      participant.lastParticipatedProjectEndDate = project.endDate;
      await participant.save();
    } else {
      participant.streak = 0;
      participant.latestRating = 0;
      await participant.save();
    }
  }

  project.ratings = finalRatings;
  project.status = "closed";
  project.winner = winner;
  project.winnerPoints = winnerPoints;
  project.closedAt = new Date();
  await project.save();

  const populated = await Project.findById(project._id)
    .populate("winner", "name")
    .populate("ratings.user", "name")
    .lean();

  return res.json(populated);
};

const voteProject = async (req, res) => {
  const { id } = req.params;
  const { candidateId, rating, comment } = req.body;

  if (!candidateId || !rating) {
    return res.status(400).json({ message: "Candidate ID and rating are required" });
  }

  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.status !== "active") {
    return res.status(400).json({ message: "Can only vote on active projects" });
  }

  // Prevent voting for self
  if (String(req.user._id) === String(candidateId)) {
    return res.status(400).json({ message: "You cannot vote for yourself" });
  }

  // Check if already voted for this candidate in this project
  const alreadyVoted = project.peerVotes.find(
    (v) => String(v.voter) === String(req.user._id) && String(v.candidate) === String(candidateId)
  );

  if (alreadyVoted) {
    alreadyVoted.rating = rating;
    alreadyVoted.comment = comment;
  } else {
    project.peerVotes.push({
      voter: req.user._id,
      candidate: candidateId,
      rating,
      comment,
    });
  }

  await project.save();
  return res.json({ message: "Vote cast successfully" });
};

const submitProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { githubUrl } = req.body;

    if (!githubUrl) {
      return res.status(400).json({ message: "Github URL is required" });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== "active") {
      return res.status(400).json({ message: "Cannot submit to a closed project" });
    }

    const existingSubmission = project.submissions.find(
      (s) => String(s.user) === String(req.user._id)
    );

    if (existingSubmission) {
      existingSubmission.githubUrl = githubUrl;
    } else {
      project.submissions.push({
        user: req.user._id,
        githubUrl,
      });
    }

    await project.save();
    return res.json({ message: "Project submitted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate } = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (title) project.title = title;
    if (description) project.description = description;
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = new Date(endDate);
    await project.save();
    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getActiveProject, listProjects, closeProject, voteProject, updateProject, submitProject, deleteProject };

