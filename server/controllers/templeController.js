const Temple = require("../models/Temple");

// Get all temples
exports.getAllTemples = async (req, res) => {
  try {
    const temples = await Temple.find();
    res.json(temples);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single temple by ID
exports.getTempleById = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    res.json(temple);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ===============================
// UPDATE TEMPLE BASIC INFO
// ===============================
exports.updateTemple = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple)
      return res.status(404).json({ message: "Temple not found" });

    const { name, location, description, darshanStart, darshanEnd } = req.body;

    temple.name = name || temple.name;
    temple.location = location || temple.location;
    temple.description = description || temple.description;
    temple.darshanStart = darshanStart || temple.darshanStart;
    temple.darshanEnd = darshanEnd || temple.darshanEnd;

    await temple.save();

    res.json({ message: "Temple updated successfully", temple });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ===============================
// ADD NEW AARTI
// ===============================
exports.addAarti = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple)
      return res.status(404).json({ message: "Temple not found" });

    temple.aartiTimings.push(req.body);

    await temple.save();

    res.json({ message: "Aarti added successfully", temple });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ===============================
// UPDATE AARTI
// ===============================
exports.updateAarti = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple)
      return res.status(404).json({ message: "Temple not found" });

    const aarti = temple.aartiTimings.id(req.params.aartiId);
    if (!aarti)
      return res.status(404).json({ message: "Aarti not found" });

    aarti.name = req.body.name || aarti.name;
    aarti.time = req.body.time || aarti.time;
    aarti.description = req.body.description || aarti.description;

    await temple.save();

    res.json({ message: "Aarti updated successfully", temple });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ===============================
// DELETE AARTI
// ===============================
exports.deleteAarti = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple)
      return res.status(404).json({ message: "Temple not found" });

    const aarti = temple.aartiTimings.id(req.params.aartiId);
    if (!aarti)
      return res.status(404).json({ message: "Aarti not found" });

    aarti.remove();

    await temple.save();

    res.json({ message: "Aarti deleted successfully", temple });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};