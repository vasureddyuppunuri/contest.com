const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const {
  createProject,
  getActiveProject,
  listProjects,
  closeProject,
  voteProject,
  submitProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/active", auth, getActiveProject);
router.get("/", auth, requireRole("admin"), listProjects);
router.post("/", auth, requireRole("admin"), createProject);
router.post("/:id/close", auth, requireRole("admin"), closeProject);
router.delete("/:id", auth, requireRole("admin"), deleteProject);
router.put("/:id", auth, requireRole("admin"), (req, res) => {
  // Directly handled in controller usually, adding placeholder for now
  require("../controllers/projectController").updateProject(req, res);
});
router.post("/:id/vote", auth, voteProject);
router.post("/:id/submit", auth, submitProject);

module.exports = router;
