# Cloudinary + Multer Upload Setup

This backend uses Multer memory storage for request parsing and Cloudinary upload streams for media persistence.

## Why this structure

- Keeps upload concerns separated:
  - Multer validation in middleware
  - Cloudinary config in config module
  - Upload/delete operations in a service
  - HTTP response shaping in controller
- Uses file size and type limits at the edge (Multer) to reduce abuse risk.
- Uses Cloudinary `secure_url` for HTTPS delivery.

## Environment variables

Set the following in your backend environment:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Notes:

- Server boot will continue without these values, but upload routes will fail until all 3 are configured.
- Do not commit secrets to source control.

## File map

- `src/config/cloudinary.js`
  - Cloudinary initialization and configuration checks.
- `src/middlewares/upload.middleware.js`
  - Multer memory-storage upload middleware with strict file limits and file type validation.
- `src/services/uploadService.js`
  - Cloudinary upload stream and delete logic.
- `src/controllers/uploadController.js`
  - Upload endpoint handlers and response payloads.
- `src/routes/uploadRoutes.js`
  - Route definitions and middleware wiring.

## Upload endpoints

All routes require authentication.

- `POST /upload/image`
  - Form field: `image`
  - Max size: 5 MB
  - Types: jpg, jpeg, png, gif, webp
- `POST /upload/document`
  - Form field: `document`
  - Max size: 25 MB
  - Types: pdf, doc, docx, xls, xlsx, ppt, pptx, txt
- `POST /upload/video`
  - Form field: `video`
  - Max size: 100 MB
  - Types: mp4, avi, mov, mkv, webm
- `DELETE /upload/:publicId`
  - Deletes from Cloudinary by public ID.

## Response shape

Successful upload response:

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "eduvers/images/abc123",
    "size": 12345,
    "mimeType": "image/png"
  }
}
```

## Error handling

- Multer errors are normalized by global error middleware.
- Validation errors (file type, file size, missing file) return `400`.
- Missing Cloudinary configuration returns `500` with `CLOUDINARY_NOT_CONFIGURED`.

## Best-practice notes

- Prefer uploading directly to Cloudinary with server-side signature only when your trust model allows client direct-upload. This project currently uses server-mediated upload.
- Keep file size limits tight and aligned to business needs.
- If very large video uploads are required, migrate to chunked upload strategy.
