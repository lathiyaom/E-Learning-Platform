const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== "string") return "downloaded-file";
  return filename.replace(/[\\/:*?"<>|]/g, "_").trim() || "downloaded-file";
};

export const downloadFileFromUrl = async (url, filename) => {
  const safeName = sanitizeFilename(filename);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not fetch file for download");
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = safeName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    window.URL.revokeObjectURL(objectUrl);
  }
};
