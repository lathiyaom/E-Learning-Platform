const mongoose = require("mongoose");
const Attendance = require("./src/models/Attendance.mongoose");
require("dotenv").config();

async function run() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/EduVers",
    );

    const tenantId = "69b82f0890cd66999363ba6e";
    const studentId = "69b82fe97836b6c6d424d4ce";
    const courseId = "69bac606691760c8190e9f02";

    const query = { tenantId, "attendanceRecords.studentId": studentId };
    console.log("Query:", query);

    const records = await Attendance.find(query).lean();
    console.log("Result length:", records.length);
    console.log(JSON.stringify(records, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
