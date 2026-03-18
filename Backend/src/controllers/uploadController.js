const {
  uploadBufferToCloudinary,
  deleteAssetFromCloudinary,
} = require("../services/uploadService");

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const uploadedFile = await uploadBufferToCloudinary(req.file, {
      folder: "eduvers/images",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        size: uploadedFile.bytes,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided",
      });
    }

    const uploadedFile = await uploadBufferToCloudinary(req.file, {
      folder: "eduvers/documents",
      resource_type: "raw",
      allowed_formats: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
    });

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        url: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        size: uploadedFile.bytes,
        mimeType: req.file.mimetype,
        name: req.file.originalname,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    const uploadedFile = await uploadBufferToCloudinary(req.file, {
      folder: "eduvers/videos",
      resource_type: "video",
      allowed_formats: ["mp4", "avi", "mov", "mkv", "webm"],
    });

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        size: uploadedFile.bytes,
        mimeType: req.file.mimetype,
        duration: uploadedFile.duration,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    const deletionResult = await deleteAssetFromCloudinary(publicId);

    if (!deletionResult.deleted) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadController: {
    uploadImage,
    uploadDocument,
    uploadVideo,
    deleteFile,
  },
};
