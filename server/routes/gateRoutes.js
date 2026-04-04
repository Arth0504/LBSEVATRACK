const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  verifyBooking,
  getTodayActivity,
  getTodayBookings,
  getBookingsByDate   // 🔥 NEW FUNCTION
} = require("../controllers/gateController");

// ================= VERIFY BOOKING =================
router.post(
  "/verify",
  protect,
  authorizeRoles("gate"),
  verifyBooking
);

// ================= TODAY BOOKINGS =================
router.get(
  "/today-bookings",
  protect,
  authorizeRoles("gate"),
  getTodayBookings
);

// ================= BOOKINGS BY DATE (NEW) =================
router.get(
  "/bookings-by-date",
  protect,
  authorizeRoles("gate"),
  getBookingsByDate
);

// ================= GATE ACTIVITY =================
router.get(
  "/my-activity",
  protect,
  authorizeRoles("gate"),
  getTodayActivity
);

module.exports = router;
