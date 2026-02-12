const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { getProfile, listParticipants, getGlobalStats, deleteUser, bulkDeleteUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/me", auth, getProfile);
router.get("/participants", auth, listParticipants);
router.get("/stats", auth, getGlobalStats);
router.delete("/bulk", auth, requireRole("admin"), bulkDeleteUsers);
router.delete("/:id", auth, requireRole("admin"), deleteUser);

module.exports = router;

module.exports = router;
