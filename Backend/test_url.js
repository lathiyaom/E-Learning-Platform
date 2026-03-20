fetch("https://res.cloudinary.com/dq5qqbfo7/raw/upload/s--PpScelLH--/v1/courses/69bad04bd7f170c6c42769e9/materials/1773914237182-FS-603_ModelPaper1.pdf")
  .then(async r => {
    console.log("Status:", r.status);
    console.log("x-cld-error:", r.headers.get("x-cld-error"));
    console.log("Body:", await r.text());
  }).catch(console.error);
