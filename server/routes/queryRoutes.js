const express = require("express");
const router = express.Router();

const {
  createQuery,
  getQueries,
  deleteQuery,
} = require("../controllers/queryController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { replyToQuery } = require("../controllers/queryController");
// ================= USER =================
router.post("/", createQuery);

// ================= ADMIN =================
router.get("/", protect, authorizeRoles("admin"), getQueries);

// ================= DELETE =================
router.delete("/:id", protect, authorizeRoles("admin"), deleteQuery);

//=====================User Replay to Query (Optional)====================
router.post("/reply/:id", protect, authorizeRoles("admin"), replyToQuery);

module.exports = router;