const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err.name, err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err?.message || err);
});

app.set("trust proxy", 1);

// ================= CORS =================
function parseOriginsList(str) {
  if (!str || typeof str !== "string") return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const envOrigins = parseOriginsList(process.env.ALLOWED_ORIGINS || "");
const clientUrl = (process.env.CLIENT_URL || "").trim();
const merged = new Set([
  ...defaultOrigins,
  ...envOrigins,
  ...(clientUrl ? [clientUrl] : []),
]);

function isLocalDevOrigin(origin) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (merged.has(origin)) return true;
  if (isLocalDevOrigin(origin)) return true;
  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin || "(none)"}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length"],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

// cors() handles OPTIONS preflight for registered routes in Express v5.
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/authRoutes");
const templeRoutes = require("./routes/templeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const gateRoutes = require("./routes/gateRoutes");
const adminRoutes = require("./routes/adminRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const slotRoutes = require("./routes/slotRoutes");
const queryRoutes = require("./routes/queryRoutes");
const noteRoutes = require("./routes/noteRoutes");
const reportRoutes = require("./routes/reportRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/temples", templeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/gates", gateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.type("text").send("SevaTrack API Running...");
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found", path: req.originalUrl });
});

app.use((err, req, res, _next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource identifier" });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate value" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((val) => val.message)
        .join(", "),
    });
  }

  const status = Number(err.status) || Number(err.statusCode) || 500;
  const message = status >= 500 ? "Internal server error" : err.message || "Request failed";

  if (status >= 500) {
    console.error(`${req.method} ${req.originalUrl} failed:`, err.message);
  }

  res.status(status).json({ message });
});

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in environment variables");
}
if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing in environment variables. Authentication will fail.");
}

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    console.error("Server listen error:", err.message);
  });
}

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected Successfully");
      startServer();
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
      startServer();
    });
} else {
  startServer();
}
