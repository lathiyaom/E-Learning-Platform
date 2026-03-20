const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const url = "https://res.cloudinary.com/dq5qqbfo7/image/upload/v1773912994/courses/69bad04bd7f170c6c42769e9/materials/1773912992173-FS-603_ModelPaper2.pdf.pdf";
const parts = url.split('/upload/');
const isRaw = url.includes('/raw/upload/');
const isVideo = url.includes('/video/upload/');
const rType = isRaw ? 'raw' : isVideo ? 'video' : 'image';

const afterUpload = parts[1];
const publicId = afterUpload.replace(/^v\d+\//, '');

const signedUrl = cloudinary.utils.url(publicId, {
    resource_type: rType,
    sign_url: true,
    secure: true
});

console.log("SIGNED URL:", signedUrl);
