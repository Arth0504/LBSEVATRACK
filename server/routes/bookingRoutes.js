const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// 🔥 IMPORTANT FIX (correct import)
const {
  createBooking,
  getMyBookings,
  cancelBooking
} = require("../controllers/bookingController");

// ✅ CREATE BOOKING
router.post("/", protect, upload.any(), createBooking);

// ✅ GET MY BOOKINGS
router.get("/my", protect, getMyBookings);

// ✅ CANCEL BOOKING
router.put("/cancel/:id", protect, cancelBooking);

module.exports = router;