const multer = require("multer");
const path = require("path");

const createUploadError = (message, statusCode = 400, code = "UPLOAD_VALIDATION_ERROR") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const memoryStorage = multer.memoryStorage();

const hasAllowedExtension = (filename, allowedExtensions) => {
  const extension = path.extname(filename || "").slice(1).toLowerCase();
  return allowedExtensions.includes(extension);
};

const createUploadMiddleware = ({ maxFileSize, allowedMimeTypes, allowedExtensions }) =>
  multer({
    storage: memoryStorage,
    limits: {
      fileSize: maxFileSize,
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      const mimeType = (file.mimetype || "").toLowerCase();
      const mimeTypeAllowed = allowedMimeTypes.includes(mimeType);
      const extensionAllowed = hasAllowedExtension(file.originalname, allowedExtensions);

      if (!mimeTypeAllowed || !extensionAllowed) {
        cb(createUploadError("Unsupported file type"));
        return;
      }

      cb(null, true);
    },
  });

const imageUpload = createUploadMiddleware({
  maxFileSize: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
});

const documentUpload = createUploadMiddleware({
  maxFileSize: 25 * 1024 * 1024,
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/octet-stream",
  ],
  allowedExtensions: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
});

const videoUpload = createUploadMiddleware({
  maxFileSize: 100 * 1024 * 1024,
  allowedMimeTypes: [
    "video/mp4",
    "video/x-msvideo",
    "video/quicktime",
    "video/x-matroska",
    "video/webm",
  ],
  allowedExtensions: ["mp4", "avi", "mov", "mkv", "webm"],
});

module.exports = {
  imageUpload,
  documentUpload,
  videoUpload,
};
