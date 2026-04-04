const Query = require("../models/Query");
const sendEmail = require("../utils/sendEmail"); // optional

// ================= CREATE QUERY =================
exports.createQuery = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const query = await Query.create({
      name,
      email,
      message,
      user: req.user?._id || null,
    });

    // 📧 Optional Email
    try {
      await sendEmail(
        process.env.EMAIL_USER,
        "New User Query ❓",
        `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
      );
    } catch (err) {
      console.log("Email failed (optional)");
    }

    res.status(201).json({
      success: true,
      message: "Query submitted successfully",
      query,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit query",
    });
  }
};


// ================= GET ALL QUERIES (ADMIN) =================
exports.getQueries = async (req, res) => {
  try {
    const queries = await Query.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.status(200).json(queries);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching queries",
    });
  }
};


// ================= DELETE QUERY =================
exports.deleteQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    await query.deleteOne();

    res.json({ message: "Query deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting query" });
  }
};
exports.replyToQuery = async (req, res) => {
  try {
    const { message } = req.body;

    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    // 📧 Send reply email
    await sendEmail(
      query.email,
      "Reply to your query 📩",
      message
    );

    res.json({ message: "Reply sent successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to send reply" });
  }
};
exports.replyToQuery = async (req, res) => {
  try {
    const { message } = req.body;

    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    // 💾 SAVE REPLY
    query.replies.push({ message });

    await query.save();

    // 📧 SEND EMAIL
    await sendEmail(
      query.email,
      "Reply to your query 📩",
      message
    );

    res.json({ message: "Reply sent " });

  } catch (error) {
    res.status(500).json({ message: "Error replying" });
  }
};