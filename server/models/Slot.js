const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    temple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Temple",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    bookedCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "full", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slot", slotSchema);
