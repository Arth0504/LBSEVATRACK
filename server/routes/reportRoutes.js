const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getReportData } = require("../controllers/reportController");

// ================= REPORT DATA =================
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getReportData
);

module.exports = router;
