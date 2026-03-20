fetch("https://res.cloudinary.com/dq5qqbfo7/raw/authenticated/s--fzB-49ue--/v1773916073/test-pdf.pdf").then(async r => {
  console.log("Fetch status:", r.status);
  console.log("x-cld-error:", r.headers.get("x-cld-error"));
});
