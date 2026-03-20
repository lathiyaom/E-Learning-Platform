const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const run = async () => {
  const publicId = "courses/69bad04bd7f170c6c42769e9/materials/1773914237182-FS-603_ModelPaper1.pdf";
  
  const urls = [
    // 1: raw, upload, attachment no sign
    cloudinary.utils.url(publicId, { resource_type: "raw", type: "upload", flags: "attachment", secure: true }),
    // 2: raw, upload, attachment signed
    cloudinary.utils.url(publicId, { resource_type: "raw", type: "upload", flags: "attachment", sign_url: true, secure: true }),
    // 3: pdf, authenticated, signed
    cloudinary.utils.url(publicId, { resource_type: "raw", type: "authenticated", sign_url: true, secure: true }),
    // 4: image, upload, attachment signed
    cloudinary.utils.url(publicId.replace(/\.pdf$/, ''), { resource_type: "image", type: "upload", flags: "attachment", sign_url: true, secure: true }),
  ];

  for (let i = 0; i < urls.length; i++) {
    try {
      const r = await fetch(urls[i]);
      console.log(`URL ${i+1}: ${r.status} ${r.headers.get("x-cld-error") || ""}`);
    } catch (e) {
      console.log(`URL ${i+1}: ERROR`);
    }
  }
};
run();
