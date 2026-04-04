const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // 🔥 CLEAN INPUT (MOST IMPORTANT)
    name = name?.trim();
    email = email?.trim().toLowerCase();

    // ================= VALIDATION =================
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email format check
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ================= CHECK EXISTING USER =================
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ================= HASH PASSWORD =================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= CREATE USER =================
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // 🔥 CLEAN INPUT
    email = email?.trim().toLowerCase();

    // ================= VALIDATION =================
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ================= FIND USER =================
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ================= BLOCK CHECK =================
    if (user.isBlocked) {
      return res.status(403).json({ message: "User blocked by admin" });
    }

    // ================= PASSWORD CHECK =================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ================= TOKEN =================
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        temple: user.temple,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ================= RESPONSE =================
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};

// ================= GET ME =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json(user);

  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({
      message: "Server error while fetching user",
    });
  }
};

// ================= UPDATE PROFILE PHOTO =================
exports.updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.profilePhoto = imageUrl;
    await user.save();

    res.json({
      message: "Profile photo updated successfully",
      profilePhoto: imageUrl,
    });

  } catch (error) {
    console.error("PROFILE PHOTO ERROR:", error);
    res.status(500).json({
      message: "Server error while updating profile photo",
    });
  }
};