const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { downloadReceipt } = require("../controllers/receiptController");

router.get("/:id", protect, downloadReceipt);

module.exports = router;
