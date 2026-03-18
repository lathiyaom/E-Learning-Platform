const { cloudinary, assertCloudinaryConfigured } = require("../config/cloudinary");

const uploadBufferToCloudinary = (file, options = {}) => {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      const error = new Error("File buffer is missing");
      error.statusCode = 400;
      error.code = "INVALID_UPLOAD_FILE";
      reject(error);
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });

    uploadStream.end(file.buffer);
  });
};

const deleteAssetFromCloudinary = async (publicId) => {
  assertCloudinaryConfigured();

  const resourceTypes = ["image", "video", "raw"];

  for (const resourceType of resourceTypes) {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    if (result?.result === "ok") {
      return { deleted: true, resourceType };
    }
  }

  return { deleted: false };
};

module.exports = {
  uploadBufferToCloudinary,
  deleteAssetFromCloudinary,
};
