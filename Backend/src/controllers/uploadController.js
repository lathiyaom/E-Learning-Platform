const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
  api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret",
});

// Image upload storage
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eduvers/images",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Document upload storage
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eduvers/documents",
    resource_type: "auto",
    allowed_formats: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
  },
});

// Video upload storage
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eduvers/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "avi", "mov", "mkv", "webm"],
    eager: [{ format: "mp4" }], // Convert to mp4
  },
});

// Upload middleware
const imageUpload = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
const documentUpload = multer({ storage: documentStorage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB
const videoUpload = multer({ storage: videoStorage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

const uploadController = {
  /**
   * Upload image
   * POST /Upload/image
   */
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: req.file.path,
          publicId: req.file.filename,
          size: req.file.size,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Upload document
   * POST /Upload/document
   */
  uploadDocument: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No document file provided",
        });
      }

      res.status(200).json({
        success: true,
        message: "Document uploaded successfully",
        data: {
          url: req.file.path,
          publicId: req.file.filename,
          size: req.file.size,
          mimeType: req.file.mimetype,
          name: req.file.originalname,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Upload video
   * POST /Upload/video
   */
  uploadVideo: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video file provided",
        });
      }

      res.status(200).json({
        success: true,
        message: "Video uploaded successfully",
        data: {
          url: req.file.path,
          publicId: req.file.filename,
          size: req.file.size,
          mimeType: req.file.mimetype,
          duration: req.file.duration,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Delete uploaded file
   * DELETE /Upload/:publicId
   */
  deleteFile: async (req, res) => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "Public ID is required",
        });
      }

      await cloudinary.uploader.destroy(publicId);

      res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = {
  uploadController,
  imageUpload,
  documentUpload,
  videoUpload,
};
