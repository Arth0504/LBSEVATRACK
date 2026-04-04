const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },

  photo: {
    type: String,
  },

  category: {
    type: String,
    enum: ["child", "adult"],
  },

  idProof: {
    type: String,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },

    members: [memberSchema],

    totalMembers: {
      type: Number,
      required: true,
    },

    
    seniorCount: {
      type: Number,
      default: 0,
    },

    qrCode: {
      type: String,
    },

    status: {
      type: String,
      enum: ["booked", "cancelled", "used", "rejected"],
      default: "booked",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);