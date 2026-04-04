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
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    darshanStart: {
      type: String,
      required: true,
    },
    darshanEnd: {
      type: String,
      required: true,
    },
    aartiTimings: [aartiSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Temple", templeSchema);
