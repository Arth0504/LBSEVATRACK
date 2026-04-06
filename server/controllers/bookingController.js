const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const QRCode = require("qrcode");
const sendEmail = require("../utils/sendEmail");

// ================= CREATE BOOKING =================
exports.createBooking = async (req, res) => {
  try {
    const { slotId } = req.body;
    const members = JSON.parse(req.body.members);
    const userId = req.user._id;

    if (!slotId)
      return res.status(400).json({ message: "Slot ID is required" });

    const slot = await Slot.findById(slotId).populate("temple");

    if (!slot)
      return res.status(404).json({ message: "Slot not found" });

    // ===== DATE VALIDATION =====
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    maxDate.setHours(0, 0, 0, 0);

    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);

    if (slotDate < today)
      return res.status(400).json({ message: "Cannot book past slot" });

    if (slotDate > maxDate)
      return res.status(400).json({
        message: "Booking allowed only within 30 days",
      });

    // ===== MEMBER VALIDATION =====
    if (!members || members.length === 0)
      return res.status(400).json({
        message: "At least 1 member required",
      });

    if (members.length > 5)
      return res.status(400).json({
        message: "Maximum 5 members allowed",
      });

    for (let m of members) {
      if (m.age <= 0 || m.age > 120) {
        return res.status(400).json({
          message: "Invalid age detected",
        });
      }
    }

    // ===== SLOT CAPACITY =====
    if (slot.bookedCount + members.length > slot.capacity)
      return res.status(400).json({
        message: "Slot capacity exceeded",
      });

    // ===== PREVENT DOUBLE BOOKING =====
    const existingBooking = await Booking.findOne({
      user: userId,
      slot: slotId,
      status: "booked",
    });

    if (existingBooking)
      return res.status(400).json({
        message: "You already booked this slot",
      });

    // ===== PROCESS MEMBERS =====
    const processedMembers = members.map((member, index) => {
      const file = req.files[index];

      const imageUrl = file
        ? `https://lbsevatrack.onrender.com/uploads/${file.filename}`
        : null;

      const category = member.age < 18 ? "child" : "adult";

      return {
        fullName: member.fullName,
        age: member.age,
        gender: member.gender,
        photo: imageUrl,
        category,
      };
    });

    // ===== SENIOR COUNT =====
    const seniorMembers = processedMembers.filter(m => m.age >= 60);
    const seniorCount = seniorMembers.length;

    if (slot.slotType === "senior") {
      if (seniorCount !== processedMembers.length) {
        return res.status(400).json({
          message: "This slot is only for senior citizens",
        });
      }
    }

    // ===== BOOKING ID =====
    const templeCode = slot.temple.name.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-5);

    const bookingId = `SEVA-${templeCode}-${year}-${timestamp}`;

    // ===== QR CODE =====
    const qrCode = await QRCode.toDataURL(bookingId);

    // ===== CREATE BOOKING =====
    const booking = await Booking.create({
      bookingId,
      user: userId,
      slot: slotId,
      members: processedMembers,
      totalMembers: processedMembers.length,
      seniorCount,
      qrCode,
      status: "booked",
    });

    // ===== UPDATE SLOT =====
    slot.bookedCount += processedMembers.length;

    if (slot.bookedCount >= slot.capacity) {
      slot.status = "full";
    }

    await slot.save();

    // ===== 🔥 EMAIL FIX (NO DELAY) =====
    const user = req.user;

    if (user?.email) {
      sendEmail(
        user.email,
        "Booking Confirmed 🙏",
        `Dear ${user.name}, your booking is successful.\nBooking ID: ${bookingId}`
      ).catch(err => console.log("Email error:", err));
    }

    // 🔥 RESPONSE FAST
    res.status(201).json({
      message: "Booking successful",
      bookingId,
      qrCode,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};