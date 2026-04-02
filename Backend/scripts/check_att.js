const mongoose = require("mongoose");
const Attendance = require("./src/models/Attendance.mongoose");
require("dotenv").config();

async function run() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/EduVers",
    );
    const recs = await Attendance.find({}).lean();
    console.log(JSON.stringify(recs, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
