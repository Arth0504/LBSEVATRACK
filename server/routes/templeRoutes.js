const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  getAllTemples,
  getTempleById,
  updateTemple,
  addAarti,
  updateAarti,
  deleteAarti,
} = require("../controllers/templeController");

// ===============================
// PUBLIC ROUTES
// ===============================

// Get all temples
router.get("/", getAllTemples);

// Get single temple by ID
router.get("/:id", getTempleById);


// ===============================
// ADMIN ONLY ROUTES
// ===============================

// Update temple basic info
router.put("/:id", protect, authorizeRoles("admin"), updateTemple);

// Add new aarti
router.post("/:id/aarti", protect, authorizeRoles("admin"), addAarti);

// Update specific aarti
router.put("/:id/aarti/:aartiId", protect, authorizeRoles("admin"), updateAarti);

// Delete specific aarti
router.delete("/:id/aarti/:aartiId", protect, authorizeRoles("admin"), deleteAarti);


module.exports = router;
