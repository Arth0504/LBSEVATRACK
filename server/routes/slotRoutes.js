const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  createSlot,
  getSlotsByTemple,
  updateSlot,
  deleteSlot,
} = require("../controllers/slotController");

// PUBLIC
router.get("/temple/:templeId", getSlotsByTemple);

// ADMIN
router.post("/", protect, authorizeRoles("admin"), createSlot);
router.put("/:id", protect, authorizeRoles("admin"), updateSlot);
router.delete("/:id", protect, authorizeRoles("admin"), deleteSlot);

module.exports = router;
