const mongoose = require("mongoose");
require("dotenv").config();
const { CourseMaterial } = require("./src/models");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  const uploadResult = { secure_url: "http://example.com/file.pdf", duration: null };
  const req = {
    file: { size: 1000, originalname: "file.pdf", mimetype: "application/pdf" },
    body: { title: "title", description: "desc", type: "document" }
  };
  const course_id = new mongoose.Types.ObjectId();
  const organizationId = new mongoose.Types.ObjectId();
  const ownerTeacherId = new mongoose.Types.ObjectId();

  const material = new CourseMaterial({
      course_id,
      organization_id: organizationId,
      teacher_id: ownerTeacherId,
      title: req.body.title || req.file.originalname,
      type: req.body.type,
      file_url: uploadResult.secure_url,
      file_size: req.file.size,
      file_name: req.file.originalname,
      mime_type: req.file.mimetype,
      duration: uploadResult.duration || null,
      description: req.body.description || "",
      is_downloadable: true,
      order: 0,
      status: "active"
  });

  try {
    const v = material.validateSync();
    console.log("Validation: ", v);
  } catch (err) {
    console.log("Validation error:", err);
  }
  process.exit();
}
run();
