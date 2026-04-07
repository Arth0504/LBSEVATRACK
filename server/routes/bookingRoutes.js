const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");

router.post("/", protect, upload.any(), createBooking);
router.get("/my", protect, getMyBookings);
router.put("/cancel/:id", protect, cancelBooking);

module.exports = router;