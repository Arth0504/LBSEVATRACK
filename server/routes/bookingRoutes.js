const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


const bookingController = require("../controllers/bookingController");

// Create booking
router.post("/", protect, upload.any(), bookingController.createBooking);

// Get my bookings
router.get("/my", protect, bookingController.getMyBookings);

// Cancel booking
router.put("/cancel/:id", protect, bookingController.cancelBooking);

module.exports = router;