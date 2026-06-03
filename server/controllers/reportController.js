const Booking = require("../models/Booking");
const EntryLog = require("../models/EntryLog");
const Temple = require("../models/Temple");
const Slot = require("../models/Slot");
const mongoose = require("mongoose");

// Helper to get date boundaries
const getDateBoundaries = (filter, customStart, customEnd) => {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (filter) {
    case "daily":
      break; // today
    case "weekly":
      start.setDate(now.getDate() - 7);
      break;
    case "monthly":
      start.setMonth(now.getMonth() - 1);
      break;
    case "yearly":
      start.setFullYear(now.getFullYear() - 1);
      break;
    case "custom":
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
      break;
  }
  return { start, end };
};

// ===============================
// GET AGGREGATED REPORT DATA
// ===============================
exports.getReportData = async (req, res) => {
  try {
    const { filter = "custom", templeId, customStart, customEnd } = req.query;
    const { start, end } = getDateBoundaries(filter, customStart, customEnd);

    const bookingQuery = { createdAt: { $gte: start, $lte: end } };
    const entryQuery = { createdAt: { $gte: start, $lte: end } };

    if (templeId && templeId !== "all") {
      // Find slots for this temple first to filter bookings
      const slots = await Slot.find({ temple: templeId }).select("_id");
      const slotIds = slots.map((s) => s._id);
      bookingQuery.slot = { $in: slotIds };
    }

    // 1. Total Bookings and Members
    const bookings = await Booking.find(bookingQuery).populate("slot");
    
    let totalBookings = 0;
    let totalMembers = 0;
    let verifiedEntries = 0;
    let pendingEntries = 0;

    let templeWise = {};
    let slotWise = {};

    for (const b of bookings) {
      if (templeId && templeId !== "all" && b.slot?.temple.toString() !== templeId) {
        continue;
      }

      totalBookings++;
      totalMembers += b.totalMembers || 0;

      if (b.status === "used") verifiedEntries++;
      else if (b.status === "booked") pendingEntries++;

      // Temple Wise
      if (b.slot?.temple) {
        const tId = b.slot.temple.toString();
        if (!templeWise[tId]) templeWise[tId] = { bookings: 0, members: 0, verified: 0 };
        templeWise[tId].bookings++;
        templeWise[tId].members += b.totalMembers || 0;
        if (b.status === "used") templeWise[tId].verified++;
      }

      // Slot Wise
      if (b.slot) {
        const sId = b.slot._id.toString();
        const slotKey = `${b.slot.date.toISOString().split('T')[0]} ${b.slot.startTime}`;
        if (!slotWise[slotKey]) slotWise[slotKey] = { bookings: 0, members: 0, verified: 0 };
        slotWise[slotKey].bookings++;
        slotWise[slotKey].members += b.totalMembers || 0;
        if (b.status === "used") slotWise[slotKey].verified++;
      }
    }

    // Populate Temple Names for TempleWise stats
    const templeIds = Object.keys(templeWise);
    const temples = await Temple.find({ _id: { $in: templeIds } });
    const templeNames = {};
    temples.forEach(t => templeNames[t._id.toString()] = t.name);

    const formattedTempleWise = Object.keys(templeWise).map(tId => ({
      templeId: tId,
      templeName: templeNames[tId] || "Unknown Temple",
      bookings: templeWise[tId].bookings || 0,
      members: templeWise[tId].members || 0,
      verified: templeWise[tId].verified || 0
    }));

    const formattedSlotWise = Object.keys(slotWise).map(key => ({
      slotTime: key,
      bookings: slotWise[key].bookings || 0,
      members: slotWise[key].members || 0,
      verified: slotWise[key].verified || 0
    }));

    // ✅ FIXED: Always return consistent structure even when empty
    res.json({
      summary: {
        totalBookings: totalBookings || 0,
        totalMembers: totalMembers || 0,
        verifiedEntries: verifiedEntries || 0,
        pendingEntries: pendingEntries || 0
      },
      templeWise: formattedTempleWise,
      slotWise: formattedSlotWise,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });

  } catch (error) {
    console.error("Report Generation Error:", error);
    res.status(500).json({ 
      message: "Error generating report data",
      summary: { totalBookings: 0, totalMembers: 0, verifiedEntries: 0, pendingEntries: 0 },
      templeWise: [],
      slotWise: []
    });
  }
};
