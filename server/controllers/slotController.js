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
// GET SLOTS (SMART EXPIRY DETECTION)
// ===============================
exports.getSlotsByTemple = async (req, res) => {
  try {
    const templeId = req.params.templeId;
    const { filter, role } = req.query;

    // 🇮🇳 Get current time in Asia/Kolkata timezone
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const todayIST = new Date(nowIST);
    todayIST.setHours(0, 0, 0, 0);

    let query = { temple: templeId };

    if (filter === "today") {
      const tomorrowIST = new Date(todayIST);
      tomorrowIST.setDate(tomorrowIST.getDate() + 1);
      query.date = { $gte: todayIST, $lt: tomorrowIST };
    } else if (filter === "tomorrow") {
      const tomorrowIST = new Date(todayIST);
      tomorrowIST.setDate(tomorrowIST.getDate() + 1);
      const dayAfterIST = new Date(tomorrowIST);
      dayAfterIST.setDate(dayAfterIST.getDate() + 1);
      query.date = { $gte: tomorrowIST, $lt: dayAfterIST };
    } else if (filter === "week") {
      const nextWeekIST = new Date(todayIST);
      nextWeekIST.setDate(nextWeekIST.getDate() + 7);
      query.date = { $gte: todayIST, $lt: nextWeekIST };
    }

    let slots = await Slot.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate("temple", "name location");

    const updatedSlots = [];

    for (let slot of slots) {
      // Convert slot date to IST timezone for comparison
      const slotDateIST = new Date(slot.date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      slotDateIST.setHours(0, 0, 0, 0);

      let isExpired = false;

      // ✅ FIXED: Proper datetime comparison with IST timezone
      if (slotDateIST < todayIST) {
        // Past date
        isExpired = true;
      } else if (slotDateIST.getTime() === todayIST.getTime()) {
        // Today - check if end time has passed
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const slotEndTimeIST = new Date(slotDateIST);
        slotEndTimeIST.setHours(endH, endM, 0, 0);
        
        // Compare full datetime in IST
        if (nowIST >= slotEndTimeIST) {
          isExpired = true;
        }
      }

      // ✅ FIXED: Only auto-expire if status is still 'active' or 'full'
      // Don't override admin-set 'closed' status back to active
      if (isExpired && slot.status !== "closed") {
        slot.status = "closed";
        await slot.save();
      }

      // ✅ FIXED: Auto-full ONLY if not manually closed by admin
      // This allows admin to keep slots 'active' even when full
      if (!isExpired && slot.bookedCount >= slot.capacity && slot.status === "active") {
        slot.status = "full";
        await slot.save();
      }

      // Hide expired/closed slots for normal devotees
      if (role !== "admin" && slot.status === "closed") {
        continue;
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
        isExpired
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

    // ✅ FIXED: Validate status values
    const validStatuses = ["active", "full", "closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be: active, full, or closed" });
    }

    if (capacity !== undefined) {
      if (capacity < slot.bookedCount) {
        return res.status(400).json({ 
          message: `Cannot reduce capacity below booked count (${slot.bookedCount})` 
        });
      }
      slot.capacity = capacity;
    }
    
    // ✅ FIXED: Admin can now reliably set any status
    if (status) slot.status = status;

    await slot.save();

    res.json({ message: "Slot updated successfully", slot });

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
