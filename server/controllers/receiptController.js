const Booking = require("../models/Booking");

exports.downloadReceipt = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "slot",
        populate: { path: "temple" },
      })
      .populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔒 Authorization
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔥 ONLY DATA (NO PDF)
    res.json(booking);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch receipt data" });
  }
};