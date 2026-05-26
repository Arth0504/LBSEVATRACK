const mongoose = require("mongoose");
const Temple = require("../models/Temple");

function normalizeAartiTimings(aartiTimings) {
  if (!Array.isArray(aartiTimings)) return [];

  return aartiTimings
    .filter(Boolean)
    .map((aarti) => ({
      _id: aarti._id,
      name: aarti.name || "",
      time: aarti.time || "",
      description: aarti.description || "",
    }));
}

function serializeTemple(temple) {
  if (!temple) return null;

  return {
    _id: temple._id,
    name: temple.name || "",
    location: temple.location || "",
    description: temple.description || "",
    darshanStart: temple.darshanStart || "",
    darshanEnd: temple.darshanEnd || "",
    aartiTimings: normalizeAartiTimings(temple.aartiTimings),
    createdAt: temple.createdAt,
    updatedAt: temple.updatedAt,
  };
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function handleTempleError(error, res, next) {
  if (
    error.name === "MongooseServerSelectionError" ||
    error.name === "MongoNetworkError" ||
    error.message?.includes("getaddrinfo")
  ) {
    return res.status(503).json({
      message: "Temple service is temporarily unavailable",
    });
  }

  return next(error);
}

// Get all temples
exports.getAllTemples = async (req, res, next) => {
  try {
    const temples = await Temple.find({}).sort({ name: 1 }).lean();
    res.status(200).json(temples.map(serializeTemple));
  } catch (error) {
    handleTempleError(error, res, next);
  }
};

// Get single temple by ID
exports.getTempleById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid temple id" });
    }

    const temple = await Temple.findById(req.params.id).lean();

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    res.status(200).json(serializeTemple(temple));
  } catch (error) {
    handleTempleError(error, res, next);
  }
};

// ===============================
// UPDATE TEMPLE BASIC INFO
// ===============================
exports.updateTemple = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid temple id" });
    }

    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    const name = sanitizeText(req.body.name);
    const location = sanitizeText(req.body.location);
    const description = sanitizeText(req.body.description);
    const darshanStart = sanitizeText(req.body.darshanStart);
    const darshanEnd = sanitizeText(req.body.darshanEnd);

    if (name) temple.name = name;
    if (location) temple.location = location;
    if (description) temple.description = description;
    if (darshanStart) temple.darshanStart = darshanStart;
    if (darshanEnd) temple.darshanEnd = darshanEnd;

    await temple.save();

    res.json({
      message: "Temple updated successfully",
      temple: serializeTemple(temple.toObject()),
    });
  } catch (error) {
    handleTempleError(error, res, next);
  }
};

// ===============================
// ADD NEW AARTI
// ===============================
exports.addAarti = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid temple id" });
    }

    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    const name = sanitizeText(req.body.name);
    const time = sanitizeText(req.body.time);
    const description = sanitizeText(req.body.description);

    if (!name || !time) {
      return res.status(400).json({ message: "Aarti name and time are required" });
    }

    temple.aartiTimings.push({ name, time, description });
    await temple.save();

    res.json({
      message: "Aarti added successfully",
      temple: serializeTemple(temple.toObject()),
    });
  } catch (error) {
    handleTempleError(error, res, next);
  }
};

// ===============================
// UPDATE AARTI
// ===============================
exports.updateAarti = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.aartiId)) {
      return res.status(400).json({ message: "Invalid temple or aarti id" });
    }

    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    const aarti = temple.aartiTimings.id(req.params.aartiId);
    if (!aarti) {
      return res.status(404).json({ message: "Aarti not found" });
    }

    const name = sanitizeText(req.body.name);
    const time = sanitizeText(req.body.time);
    const description = sanitizeText(req.body.description);

    if (name) aarti.name = name;
    if (time) aarti.time = time;
    if (description) aarti.description = description;

    await temple.save();

    res.json({
      message: "Aarti updated successfully",
      temple: serializeTemple(temple.toObject()),
    });
  } catch (error) {
    handleTempleError(error, res, next);
  }
};

// ===============================
// DELETE AARTI
// ===============================
exports.deleteAarti = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.aartiId)) {
      return res.status(400).json({ message: "Invalid temple or aarti id" });
    }

    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    const aarti = temple.aartiTimings.id(req.params.aartiId);
    if (!aarti) {
      return res.status(404).json({ message: "Aarti not found" });
    }

    temple.aartiTimings.pull(req.params.aartiId);
    await temple.save();

    res.json({
      message: "Aarti deleted successfully",
      temple: serializeTemple(temple.toObject()),
    });
  } catch (error) {
    handleTempleError(error, res, next);
  }
};
