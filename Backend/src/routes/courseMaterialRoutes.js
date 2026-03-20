const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CourseMaterial, Course } = require("../models");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only videos, PDFs, documents, and images are allowed.'), false);
    }
  }
});

// Upload course material
router.post("/upload", authenticate, authorize("teacher", "admin"), tenantScope, upload.single("file"), async (req, res) => {
  try {
    const { course_id, title, description, type, is_downloadable } = req.body;
    const teacherId = req.user.id;
    const organizationId = req.tenantId;
    const isAdmin = String(req.user.userType || "").toLowerCase() === "admin";
    const course = await Course.findOne({
      _id: course_id,
      $or: [{ tenantId: organizationId }, { organization_id: organizationId }],
    }).select("teacher_id createdBy");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found in your organization",
      });
    }

    const ownerTeacherId = course.teacher_id || course.createdBy || teacherId;

    if (!isAdmin && String(ownerTeacherId) !== String(teacherId)) {
      return res.status(403).json({
        success: false,
        message: "Teachers can upload files only for their own courses",
      });
    }


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: type === "video" ? "video" : "auto",
          folder: `courses/${course_id}/materials`,
          public_id: `${Date.now()}-${req.file.originalname}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Create material record
    const material = new CourseMaterial({
      course_id,
      organization_id: organizationId,
      teacher_id: ownerTeacherId,
      title: title || req.file.originalname,
      type,
      file_url: uploadResult.secure_url,
      file_size: req.file.size,
      file_name: req.file.originalname,
      mime_type: req.file.mimetype,
      duration: uploadResult.duration || null,
      description: description || "",
      is_downloadable: is_downloadable !== "false",
      order: 0,
      status: "active"
    });

    await material.save();

    res.status(201).json({
      success: true,
      message: "Material uploaded successfully",
      data: material
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload material",
      error: error.message
    });
  }
});

// Get materials for a course
router.get("/course/:courseId", authenticate, tenantScope, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userType = req.user.userType;

    // Get materials with proper filtering based on user role
    let materials;
    if (userType === "teacher") {
      // Teachers can see all materials for their courses
      materials = await CourseMaterial.find({
        course_id: courseId,
        teacher_id: userId,
        organization_id: req.tenantId,
        status: "active"
      }).sort({ order: 1, createdAt: 1 });
    } else if (userType === "student") {
      // Students can only see materials from enrolled courses
      // This would require checking enrollment - simplified for now
      materials = await CourseMaterial.find({
        course_id: courseId,
        organization_id: req.tenantId,
        status: "active"
      }).sort({ order: 1, createdAt: 1 });
    } else {
      // Admins can see all materials in their organization
      materials = await CourseMaterial.find({
        course_id: courseId,
        organization_id: req.tenantId,
        status: "active"
      }).sort({ order: 1, createdAt: 1 });
    }

    res.status(200).json({
      success: true,
      data: materials,
      count: materials.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
      error: error.message
    });
  }
});

// Update material
router.patch("/:id", authenticate, authorize("teacher", "admin"), tenantScope, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_downloadable, order } = req.body;
    const teacherId = req.user.id;
    const isAdmin = String(req.user.userType || "").toLowerCase() === "admin";

    const filter = isAdmin
      ? { _id: id, organization_id: req.tenantId }
      : { _id: id, teacher_id: teacherId, organization_id: req.tenantId };

    const material = await CourseMaterial.findOne(filter);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    // Update fields
    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (is_downloadable !== undefined) material.is_downloadable = is_downloadable;
    if (order !== undefined) material.order = order;

    await material.save();

    res.status(200).json({
      success: true,
      message: "Material updated successfully",
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update material",
      error: error.message
    });
  }
});

// Delete material
router.delete("/:id", authenticate, authorize("teacher", "admin"), tenantScope, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const isAdmin = String(req.user.userType || "").toLowerCase() === "admin";

    const filter = isAdmin
      ? { _id: id, organization_id: req.tenantId }
      : { _id: id, teacher_id: teacherId, organization_id: req.tenantId };

    const material = await CourseMaterial.findOne(filter);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    // Delete from Cloudinary
    const publicId = material.file_url.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`courses/${material.course_id}/materials/${publicId}`, {
      resource_type: material.type === "video" ? "video" : "image"
    });

    // Delete from database
    await CourseMaterial.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Material deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete material",
      error: error.message
    });
  }
});

module.exports = router;
