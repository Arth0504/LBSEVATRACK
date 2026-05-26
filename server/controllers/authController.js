const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPublicUploadUrl } = require("../utils/publicUrl");

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isBcryptHash(value) {
  return typeof value === "string" && BCRYPT_HASH_REGEX.test(value);
}

function findUserByEmail(email) {
  return User.findOne({
    email: { $regex: `^${escapeRegex(email)}$`, $options: "i" },
  }).select("+password");
}

async function verifyPasswordAndMigrate(user, candidatePassword) {
  const storedPassword = typeof user.password === "string" ? user.password : "";

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(candidatePassword, storedPassword);
  }

  if (candidatePassword !== storedPassword) {
    return false;
  }

  user.password = await bcrypt.hash(candidatePassword, 10);
  await user.save();
  return true;
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT secret is not configured");
    error.status = 503;
    throw error;
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      temple: user.temple,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ================= REGISTER =================
exports.register = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    email = normalizeEmail(email);
    password = typeof password === "string" ? password : "";

    // ================= VALIDATION =================
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ================= CHECK EXISTING USER =================
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ================= CREATE USER =================
    const hashedPassword = await bcrypt.hash(password, 10);
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
    next(error);
  }
};

// ================= LOGIN =================
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    email = normalizeEmail(email);
    password = typeof password === "string" ? password : "";

    // ================= VALIDATION =================
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ================= FIND USER =================
    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ================= BLOCK CHECK =================
    if (user.isBlocked) {
      return res.status(403).json({ message: "User blocked by admin" });
    }

    // ================= PASSWORD CHECK =================
    const isMatch = await verifyPasswordAndMigrate(user, password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ================= TOKEN =================
    const token = createToken(user);

    // ================= RESPONSE =================
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        temple: user.temple,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET ME =================
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = userId ? await User.findById(userId).select("-password") : null;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE PROFILE PHOTO =================
exports.updateProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const imageUrl = getPublicUploadUrl(req, req.file.filename);
    const userId = req.user?._id || req.user?.id;
    const user = userId ? await User.findById(userId) : null;

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
    next(error);
  }
};
