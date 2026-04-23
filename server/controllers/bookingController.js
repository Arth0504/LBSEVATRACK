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
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #FF9933; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #FF9933; color: white; padding: 20px; text-align: center;">
            <h2>🙏 Darshan Booking Confirmed</h2>
          </div>
          <div style="padding: 20px; background-color: #FAFAFA; color: #333;">
            <p>Dear Devotee,</p>
            <p>Your darshan booking has been successfully confirmed. Here are the details:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #FF9933;">
              <p><strong>Booking ID:</strong> ${bookingId}</p>
              <p><strong>Date & Time:</strong> ${slot.date.toISOString().split('T')[0]} | ${slot.startTime} - ${slot.endTime}</p>
              <p><strong>Temple:</strong> ${slot.temple.name}</p>
              <p><strong>Total Members:</strong> ${processedMembers.length}</p>
            </div>
            <p>Please present your Booking ID or QR code at the temple gate.</p>
            <p>May you have a blessed darshan.</p>
            <br/>
            <p><strong>SevaTrack Team</strong></p>
          </div>
        </div>
      `;
      sendEmail(
        req.user.email,
        "🙏 Darshan Booking Confirmed - SevaTrack",
        emailHtml
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