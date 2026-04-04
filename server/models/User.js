const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    profilePhoto: {
      type: String, // image URL
    },

    role: {
      type: String,
      enum: ["admin", "user", "gate"],
      default: "user",
    },

    temple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Temple",
      default: null,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
