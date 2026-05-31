const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
// agar admin middleware hai to use karo

const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

// Admin create
router.post("/", protect, createNote);

// User view
router.get("/", getNotes);

// Admin update
router.put("/:id", protect, updateNote);

// Admin delete
router.delete("/:id", protect, deleteNote);

module.exports = router;