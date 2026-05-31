const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { register, login, getMe, updateProfile } = require("../controllers/authController");

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// GET ME
router.get("/me", protect, getMe);

// UPDATE PROFILE
router.put("/profile", protect, updateProfile);

module.exports = router;
