const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// 🔥 STATIC UPLOADS FOLDER
app.use("/uploads", express.static("uploads"));

// ================= ROUTE IMPORTS =================
const authRoutes = require("./routes/authRoutes");
const templeRoutes = require("./routes/templeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const gateRoutes = require("./routes/gateRoutes");
const adminRoutes = require("./routes/adminRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const slotRoutes = require("./routes/slotRoutes");
const queryRoutes = require("./routes/queryRoutes");

// 🔥 NEW NOTE ROUTE
const noteRoutes = require("./routes/noteRoutes");

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/temples", templeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/gates", gateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/query", queryRoutes);

// 🔥 NOTE BOARD ROUTE ADD
app.use("/api/notes", noteRoutes);

// ================= ROOT TEST =================
app.get("/", (req, res) => {
  res.send("SevaTrack API Running...");
});

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Error:", err));

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});