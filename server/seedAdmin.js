const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const seedAdmin = async () => {
  try {
    const adminEmail = "admin@sevatrack.com";
    const adminExists = await User.findOne({
      email: { $regex: `^${escapeRegex(adminEmail)}$`, $options: "i" },
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: "admin123",
      role: "admin",
    });

    console.log("Admin Created Successfully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedAdmin();
