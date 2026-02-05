const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { getProfile, listParticipants, getGlobalStats } = require("../controllers/userController");

const router = express.Router();

router.get("/me", auth, getProfile);
router.get("/participants", auth, listParticipants);
router.get("/stats", auth, getGlobalStats);
router.delete("/:id", auth, requireRole("admin"), (req, res) => {
  require("../controllers/userController").deleteUser(req, res);
});

module.exports = router;
