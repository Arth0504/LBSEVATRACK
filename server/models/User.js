const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

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

userSchema.pre("validate", function normalizeUserFields() {
  if (typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }

  if (typeof this.name === "string") {
    this.name = this.name.trim();
  }

});

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  if (BCRYPT_HASH_REGEX.test(this.password)) {
    return;
  }

  this.password = await bcrypt.hash(String(this.password), 10);
});

module.exports = mongoose.model("User", userSchema);
