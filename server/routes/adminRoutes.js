const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const adminController = require("../controllers/adminController");

// ================= DASHBOARD =================
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  adminController.getDashboardStats
);

// ================= RECENT BOOKINGS =================
router.get(
  "/recent-bookings",
  protect,
  authorizeRoles("admin"),
  adminController.getRecentBookings
);

// ================= RECENT CANCELLED =================
router.get(
  "/cancelled-bookings",
  protect,
  authorizeRoles("admin"),
  adminController.getRecentCancelled
);

// ================= VIEW USER BOOKINGS =================
router.get(
  "/user-bookings/:id",
  protect,
  authorizeRoles("admin"),
  adminController.getUserBookings
);

// ================= ADMIN CANCEL BOOKING =================
router.put(
  "/cancel-booking/:id",
  protect,
  authorizeRoles("admin"),
  adminController.adminCancelBooking
);

// ================= GATE ACTIVITY =================
router.get(
  "/gate-activity",
  protect,
  authorizeRoles("admin"),
  adminController.getGateActivity
);

// ================= ANALYTICS =================
router.get(
  "/analytics",
  protect,
  authorizeRoles("admin"),
  adminController.getTempleAnalyticsByDate
);

// ================= USER MANAGEMENT =================
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  adminController.getAllUsers
);

router.put(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  adminController.updateUserRole
);

router.get(
  "/activities",
  protect,
  authorizeRoles("admin"),
  adminController.getActivities
);
router.put(
  "/users/block/:id",
  protect,
  authorizeRoles("admin"),
  adminController.toggleBlockUser
);

router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  adminController.deleteUser
);

// ================= CREATE GATE =================
router.post(
  "/create-gate",
  protect,
  authorizeRoles("admin"),
  adminController.createGate
);

module.exports = router;
