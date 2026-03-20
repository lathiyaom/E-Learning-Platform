const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
async function run() {
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "courses/test/materials",
          public_id: "test-file",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(Buffer.from("dummy content for a doc file"));
    });
    console.log("Upload result:", uploadResult);
  } catch (err) {
    console.error("Cloudinary error:", err.message);
  }
}
run();
