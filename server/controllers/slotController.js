const Slot = require("../models/Slot");
const Temple = require("../models/Temple");

// ===============================
// CREATE AUTO 30-MIN SLOTS
// ===============================
exports.createSlot = async (req, res) => {
  try {
    const { templeId, date, startTime, endTime, capacity } = req.body;

    if (!templeId || !date || !startTime || !endTime || !capacity)
      return res.status(400).json({ message: "All fields are required" });

    const temple = await Temple.findById(templeId);
    if (!temple)
      return res.status(404).json({ message: "Temple not found" });

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (slotDate < today)
      return res.status(400).json({ message: "Cannot create past slots" });

    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const toTimeString = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    let start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (start >= end)
      return res.status(400).json({ message: "End time must be greater than start time" });

    const createdSlots = [];

    while (start + 30 <= end) {
      const next = start + 30;

      const slotStart = toTimeString(start);
      const slotEnd = toTimeString(next);

      const exists = await Slot.findOne({
        temple: templeId,
        date: slotDate,
        startTime: slotStart,
      });

      if (!exists) {
        const newSlot = await Slot.create({
          temple: templeId,
          date: slotDate,
          startTime: slotStart,
          endTime: slotEnd,
          capacity,
          status: "active",
        });

        createdSlots.push(newSlot);
      }

      start = next;
    }

    res.status(201).json({
      message: `${createdSlots.length} slots created`,
      slots: createdSlots,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// GET SLOTS (AUTO CLOSE PAST DATE)
// ===============================
exports.getSlotsByTemple = async (req, res) => {
  try {
    const templeId = req.params.templeId;

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let slots = await Slot.find({ temple: templeId })
      .sort({ date: 1, startTime: 1 })
      .populate("temple", "name location");

    const updatedSlots = [];

    for (let slot of slots) {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);

      // 🔥 AUTO CLOSE IF DATE PASSED
      if (slotDate < today && slot.status !== "closed") {
        slot.status = "closed";
        await slot.save();
      }

      // 🔥 AUTO FULL CHECK
      if (slot.bookedCount >= slot.capacity && slot.status !== "closed") {
        slot.status = "full";
        await slot.save();
      }

      const percentage =
        slot.capacity > 0
          ? (slot.bookedCount / slot.capacity) * 100
          : 0;

      let crowdLevel = "Low";
      if (percentage >= 75) crowdLevel = "High";
      else if (percentage >= 40) crowdLevel = "Medium";

      updatedSlots.push({
        ...slot._doc,
        crowdLevel,
        percentage: percentage.toFixed(2),
      });
    }

    res.json(updatedSlots);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// UPDATE SLOT
// ===============================
exports.updateSlot = async (req, res) => {
  try {
    const { capacity, status } = req.body;

    const slot = await Slot.findById(req.params.id);
    if (!slot)
      return res.status(404).json({ message: "Slot not found" });

    if (capacity !== undefined) slot.capacity = capacity;
    if (status) slot.status = status;

    await slot.save();

    res.json({ message: "Slot updated", slot });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// DELETE SLOT
// ===============================
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot)
      return res.status(404).json({ message: "Slot not found" });

    await slot.deleteOne();

    res.json({ message: "Slot deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
