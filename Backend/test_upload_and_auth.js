const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const run = async () => {
  try {
    const uploadResult = await cloudinary.uploader.upload(
      "data:application/pdf;base64,JVBERi0xLgoxIDAgb2JqPDwvUGFnZXMgMiAwIFI+PmVuZG9iagoyIDAgb2JqPDwvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqCjMgMCBvYmo8PC9QYXJlbnQgMiAwIFI+PmVuZG9iagp0cmFpbGVyIDw8L1Jvb3QgMSAwIFI+Pg==",
      {
        resource_type: "raw",
        type: "authenticated",
        public_id: "test-pdf.pdf"
      }
    );
    console.log("Uploaded successfully:", uploadResult.secure_url);

    const signedUrl = cloudinary.utils.url(uploadResult.public_id, {
      resource_type: "raw",
      type: "authenticated",
      sign_url: true,
      secure: true
    });

    console.log("Signed URL:", signedUrl);

    const r = await fetch(signedUrl);
    console.log("Fetch status:", r.status);
    console.log("x-cld-error:", r.headers.get("x-cld-error"));

  } catch (e) {
    console.error("ERROR:", e);
  }
};
run();
