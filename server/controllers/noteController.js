const Note = require("../models/Note");

// CREATE NOTE (ADMIN)
exports.createNote = async (req, res) => {
  try {
    const { title, message, expiryDate, isPinned, temple, isActive } = req.body;

    const note = await Note.create({
      title,
      message,
      expiryDate: expiryDate || null,
      isPinned: isPinned || false,
      temple: temple || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ message: "Note created", note });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE NOTE (ADMIN)
exports.updateNote = async (req, res) => {
  try {
    const { title, message, expiryDate, isPinned, temple, isActive } = req.body;
    
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (title !== undefined) note.title = title;
    if (message !== undefined) note.message = message;
    if (expiryDate !== undefined) note.expiryDate = expiryDate;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (temple !== undefined) note.temple = temple || null;
    if (isActive !== undefined) note.isActive = isActive;

    await note.save();

    res.json({ message: "Note updated", note });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL ACTIVE NOTES (USER)
exports.getNotes = async (req, res) => {
  try {
    const { templeId, showAll } = req.query; // Admin might want to showAll
    const query = {};

    if (showAll !== "true") {
      query.isActive = true;
      // Filter out expired notes
      query.$or = [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ];
      
      // If a user queries for a specific temple, show global notes AND temple notes
      if (templeId) {
        query.temple = { $in: [null, templeId] };
      }
    }

    const notes = await Note.find(query)
      .populate("temple", "name")
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(notes);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE NOTE (ADMIN)
exports.deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: "Note deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};