const mongoose = require("mongoose");
const attendanceService = require("./src/services/attendanceService");
require("dotenv").config();

async function run() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/EduVers",
    );

    const tenantId = "69b82f0890cd66999363ba6e";
    const studentId = "69b82fe97836b6c6d424d4ce";
    const courseId = "69bac606691760c8190e9f02";

    const data = await attendanceService.getStudentAttendance(
      tenantId,
      studentId,
      courseId,
    );
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
