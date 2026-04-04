const Note = require("../models/Note");

// CREATE NOTE (ADMIN)
exports.createNote = async (req, res) => {
  try {
    const { title, message } = req.body;

    const note = await Note.create({
      title,
      message,
    });

    res.status(201).json({ message: "Note created", note });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL ACTIVE NOTES (USER)
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ isActive: true })
      .sort({ createdAt: -1 });

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