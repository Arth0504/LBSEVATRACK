const mongoose = require("mongoose");
require("dotenv").config();

const Temple = require("./models/Temple");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const seedTemples = async () => {
  try {
    await Temple.deleteMany();

    await Temple.insertMany([
      {
        name: "Dwarkadhish Temple",
        location: "Dwarka, Gujarat",
        description: "Famous temple of Lord Krishna.",
        darshanStart: "6:00 AM",
        darshanEnd: "9:00 PM",
        aartiTimings: [
          { name: "Mangla Aarti", time: "6:30 AM" },
          { name: "Rajbhog Aarti", time: "12:00 PM" },
          { name: "Sandhya Aarti", time: "7:00 PM" },
        ],
      },
      {
        name: "Somnath Temple",
        location: "Somnath, Gujarat",
        description: "One of the 12 Jyotirlinga temples.",
        darshanStart: "6:00 AM",
        darshanEnd: "9:30 PM",
        aartiTimings: [
          { name: "Morning Aarti", time: "7:00 AM" },
          { name: "Afternoon Aarti", time: "12:00 PM" },
          { name: "Evening Aarti", time: "7:00 PM" },
        ],
      },
      {
        name: "Ambaji Temple",
        location: "Ambaji, Gujarat",
        description: "Sacred temple of Goddess Amba.",
        darshanStart: "7:00 AM",
        darshanEnd: "8:00 PM",
        aartiTimings: [
          { name: "Morning Aarti", time: "8:00 AM" },
          { name: "Rajbhog Aarti", time: "12:00 PM" },
          { name: "Evening Aarti", time: "6:00 PM" },
        ],
      },
    ]);

    console.log("Temples Seeded Successfully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedTemples();
