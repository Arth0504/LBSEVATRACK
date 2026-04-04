const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const User = require("../models/User");
const EntryLog = require("../models/EntryLog");
const Activity = require("../models/Activity");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail"); // 📧 EMAIL


// ================= DASHBOARD =================
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalBookingsToday = await Booking.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const totalVisitorsToday = await Booking.countDocuments({
      status: "used",
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    const cancelledToday = await Booking.countDocuments({
      status: "cancelled",
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    const fullSlots = await Slot.countDocuments({ status: "full" });
    const activeSlots = await Slot.countDocuments({ status: "active" });

    res.json({
      totalBookingsToday,
      totalVisitorsToday,
      cancelledToday,
      fullSlots,
      activeSlots,
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error" });
  }
};


// ================= RECENT BOOKINGS =================
exports.getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate({
        path: "slot",
        populate: { path: "temple", select: "name location" },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};


// ================= RECENT CANCELLED BOOKINGS =================
exports.getRecentCancelled = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "cancelled" })
      .populate("user", "name email")
      .populate({
        path: "slot",
        populate: { path: "temple", select: "name location" },
      })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Cancelled fetch error" });
  }
};


// ================= VIEW USER BOOKINGS =================
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.id })
      .populate("user", "name email")
      .populate({
        path: "slot",
        populate: { path: "temple", select: "name location" },
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};


// ================= ADMIN CANCEL BOOKING =================
exports.adminCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("slot")
      .populate("user");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "booked")
      return res.status(400).json({ message: "Cannot cancel this booking" });

    booking.status = "cancelled";
    await booking.save();

    booking.slot.bookedCount -= booking.totalMembers;

    if (booking.slot.bookedCount < booking.slot.capacity) {
      booking.slot.status = "active";
    }

    await booking.slot.save();

    // 🔔 Activity
    await Activity.create({
      message: "Booking cancelled by admin",
      type: "booking",
    });

    // 📧 Email
    if (booking.user?.email) {
      await sendEmail(
        booking.user.email,
        "Booking Cancelled ❌",
        `Dear ${booking.user.name}, your booking has been cancelled.`
      );
    }

    res.json({ message: "Booking cancelled by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cancel failed" });
  }
};


// ================= GATE ACTIVITY =================
exports.getGateActivity = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalEntriesToday = await EntryLog.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    res.json({ totalEntriesToday });
  } catch (error) {
    res.status(500).json({ message: "Gate activity error" });
  }
};


// ================= ANALYTICS =================
exports.getTempleAnalyticsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate)
      return res.status(400).json({ message: "Date range required" });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      createdAt: { $gte: start, $lte: end },
    });

    res.json({ totalBookings: bookings.length });
  } catch (error) {
    res.status(500).json({ message: "Analytics error" });
  }
};


// ================= USER MANAGEMENT =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $nin: ["admin", "gate"] },
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};


exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["admin", "user", "gate"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    await Activity.create({
      message: `User role updated (${user.name})`,
      type: "user",
    });

    res.json({ message: "Role updated" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    await user.deleteOne();

    await Activity.create({
      message: `User ${user.name} deleted`,
      type: "user",
    });

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};


exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    await Activity.create({
      message: user.isBlocked
        ? `User ${user.name} blocked`
        : `User ${user.name} unblocked`,
      type: "user",
    });

    res.json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
    });
  } catch (error) {
    res.status(500).json({ message: "Block failed" });
  }
};


// ================= CREATE GATE =================
exports.createGate = async (req, res) => {
  try {
    const { name, email, password, temple } = req.body;

    if (!name || !email || !password || !temple)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const gate = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "gate",
      temple,
    });

    await Activity.create({
      message: `Gate created (${name})`,
      type: "gate",
    });

    res.status(201).json({ message: "Gate created", gate });
  } catch (error) {
    res.status(500).json({ message: "Gate creation failed" });
  }
};


// ================= NOTIFICATIONS =================
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};