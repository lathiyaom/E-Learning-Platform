const express = require("express");
const router = express.Router();
const { uploadController } = require("../controllers/uploadController");
const {
  imageUpload,
  documentUpload,
  videoUpload,
} = require("../middlewares/upload.middleware");
const { authenticate } = require("../middlewares/authMiddleware");

// All upload routes require authentication
router.use(authenticate);

// Upload image
router.post("/image", imageUpload.single("image"), uploadController.uploadImage);

// Upload document
router.post("/document", documentUpload.single("document"), uploadController.uploadDocument);

// Upload video
router.post("/video", videoUpload.single("video"), uploadController.uploadVideo);

// Delete file
router.delete("/:publicId", uploadController.deleteFile);

module.exports = router;
