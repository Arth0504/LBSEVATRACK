const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  replies: [
    {
      message: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Query", querySchema);