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

    // VALIDATION
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);

    if (slotDate < today)
      return res.status(400).json({ message: "Cannot book past slot" });

    if (!members || members.length === 0)
      return res.status(400).json({ message: "At least 1 member required" });

    if (members.length > 5)
      return res.status(400).json({ message: "Maximum 5 members allowed" });

    if (slot.bookedCount + members.length > slot.capacity)
      return res.status(400).json({ message: "Slot capacity exceeded" });

    const existingBooking = await Booking.findOne({
      user: userId,
      slot: slotId,
      status: "booked",
    });

    if (existingBooking)
      return res.status(400).json({
        message: "You already booked this slot",
      });

    // PROCESS MEMBERS
    const processedMembers = members.map((m, index) => {
      const file = req.files[index];

      return {
        fullName: m.fullName,
        age: m.age,
        gender: m.gender,
        photo: file
          ? `https://lbsevatrack.onrender.com/uploads/${file.filename}`
          : null,
        category: m.age < 18 ? "child" : "adult",
      };
    });

    const bookingId = `SEVA-${Date.now()}`;

    // CREATE BOOKING
    const booking = await Booking.create({
      bookingId,
      user: userId,
      slot: slotId,
      members: processedMembers,
      totalMembers: processedMembers.length,
      qrCode: null,
      status: "booked",
    });

    // UPDATE SLOT
    slot.bookedCount += processedMembers.length;
    if (slot.bookedCount >= slot.capacity) slot.status = "full";
    await slot.save();

    // FAST RESPONSE
    res.status(201).json({
      message: "Booking successful",
      bookingId,
    });

    // BACKGROUND QR
    QRCode.toDataURL(bookingId)
      .then((qr) =>
        Booking.findByIdAndUpdate(booking._id, { qrCode: qr })
      )
      .catch(console.log);

    // BACKGROUND EMAIL
    if (req.user?.email) {
      sendEmail(
        req.user.email,
        "Booking Confirmed",
        `Booking ID: ${bookingId}`
      ).catch(console.log);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET MY BOOKINGS =================
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "slot",
        populate: {
          path: "temple",
          select: "name location",
        },
      })
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= CANCEL BOOKING =================
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("slot");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    booking.slot.bookedCount -= booking.totalMembers;
    booking.slot.status = "active";
    await booking.slot.save();

    res.json({ message: "Booking cancelled" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};