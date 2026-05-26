const mongoose = require("mongoose");

const aartiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const templeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    darshanStart: {
      type: String,
      required: true,
      trim: true,
    },
    darshanEnd: {
      type: String,
      required: true,
      trim: true,
    },
    aartiTimings: {
      type: [aartiSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Temple", templeSchema);
