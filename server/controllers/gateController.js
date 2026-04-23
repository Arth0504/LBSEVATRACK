const Booking = require("../models/Booking");
const EntryLog = require("../models/EntryLog");

// ================= VERIFY BOOKING =================
exports.verifyBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID required" });
    }

    const booking = await Booking.findOne({ bookingId })
      .populate("user", "name profilePhoto")
      .populate({
        path: "slot",
        populate: { path: "temple", select: "name date startTime endTime" },
      });

    if (!booking) {
      return res.status(404).json({ message: "Invalid Booking ID" });
    }

    // ================= TEMPLE SECURITY =================
    if (
      !req.user.temple ||
      booking.slot.temple._id.toString() !== req.user.temple.toString()
    ) {
      return res.status(403).json({
        message: "This booking belongs to another temple",
      });
    }

    if (booking.status === "used") {
      return res.status(400).json({ message: "Booking already used" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking cancelled" });
    }

    if (booking.status === "rejected") {
      return res.status(400).json({ message: "Booking rejected" });
    }

    // ================= SLOT DATE VALIDATION =================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slotDate = new Date(booking.slot.date);
    slotDate.setHours(0, 0, 0, 0);

    if (slotDate.getTime() !== today.getTime()) {
      return res.status(400).json({ message: "Slot date mismatch" });
    }

    // ================= COUNT ADULT / CHILD =================
    const adultCount = booking.members.filter(
      (m) => m.category === "adult"
    ).length;

    const childCount = booking.members.filter(
      (m) => m.category === "child"
    ).length;

    // ================= MARK AS USED =================
    booking.status = "used";
    await booking.save();

    // ================= CREATE ENTRY LOG =================
    await EntryLog.create({
      booking: booking._id,
      scannedBy: req.user._id,
    });

    res.json({
      message: "Entry verified successfully",
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        userName: booking.user?.name,
        userPhoto: booking.user?.profilePhoto || null,
        templeName: booking.slot.temple.name,
        slotTime: `${booking.slot.startTime} - ${booking.slot.endTime}`,
        totalMembers: booking.totalMembers,
        adultCount,
        childCount,
        members: booking.members,
        status: booking.status,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= TODAY BOOKINGS =================
exports.getTodayBookings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      status: "booked",
    })
      .populate("user", "name")
      .populate({
        path: "slot",
        populate: { path: "temple", select: "name date startTime endTime" },
      });

    const filtered = bookings.filter((b) => {
      if (!b.slot?.date) return false;

      const slotDate = new Date(b.slot.date);
      slotDate.setHours(0, 0, 0, 0);

      return slotDate.getTime() === today.getTime();
    });

    res.json(filtered);

  } catch (error) {
    res.status(500).json({ message: "Today's bookings error" });
  }
};

// ================= TODAY ACTIVITY =================
exports.getTodayActivity = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalEntriesToday = await EntryLog.countDocuments({
      scannedBy: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    res.json({
      totalEntriesToday,
    });

  } catch (error) {
    res.status(500).json({ message: "Gate activity error" });
  }
};
// ================= BOOKINGS BY DATE =================
exports.getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (!req.user.temple) {
      return res.status(403).json({ message: "Temple not assigned" });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // 1. Find all slots for this temple on the selected date
    const slots = await require("../models/Slot").find({
      temple: req.user.temple,
      date: { $gte: selectedDate, $lt: nextDay }
    });

    const slotIds = slots.map(s => s._id);

    // 2. Fetch bookings only for those slots
    const bookings = await Booking.find({
      slot: { $in: slotIds },
      status: { $in: ["booked", "used"] },
    })
      .populate("user", "name")
      .populate({
        path: "slot",
        populate: { path: "temple", select: "name date startTime endTime" },
      });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ message: "Booking fetch error" });
  }
};
