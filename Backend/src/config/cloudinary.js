const cloudinary = require("cloudinary").v2;

const requiredCloudinaryEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingCloudinaryEnvVars = requiredCloudinaryEnvVars.filter(
  (envVar) => !process.env[envVar]
);

const isCloudinaryConfigured = missingCloudinaryEnvVars.length === 0;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const getCloudinaryConfigError = () => {
  if (isCloudinaryConfigured) {
    return null;
  }

  return new Error(
    `Cloudinary is not configured. Missing env vars: ${missingCloudinaryEnvVars.join(", ")}`
  );
};

const assertCloudinaryConfigured = () => {
  const configError = getCloudinaryConfigError();

  if (configError) {
    configError.statusCode = 500;
    configError.code = "CLOUDINARY_NOT_CONFIGURED";
    throw configError;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  missingCloudinaryEnvVars,
  assertCloudinaryConfigured,
};
