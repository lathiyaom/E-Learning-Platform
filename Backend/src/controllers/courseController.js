const courseService = require("../services/courseService");
const { Course } = require("../models");
const logger = require("../utils/logger");

const CreateCourse = async (req, res) => {
  const startTime = Date.now();
  const userId = req.user?.id;
  const tenantId = req.tenantId || (req.user?.role === "tenant" ? req.user.id : req.user?.tenantId);

  try {
    logger.info("Course creation attempt", { userId, tenantId, title: req.body?.title });

    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("Course creation failed: Empty request body", { userId });
      return res.status(400).json({
        message: "Request body is empty or not properly parsed",
        success: false,
      });
    }

    // Add tenantId and createdBy from authenticated user
    const courseData = {
      ...req.body,
      createdBy: userId,
      tenantId,
    };

    const newCourse = await courseService.createCourse(courseData);

    const duration = Date.now() - startTime;
    logger.logSuccess("Course created", userId, { 
      courseId: newCourse.id,
      title: newCourse.title,
      tenantId,
      duration: `${duration}ms`
    });

    return res.status(200).json({
      message: "The Course Successfully Added",
      success: true,
      data: newCourse,
    });
  } catch (error) {
    logger.logFailure("Course creation", userId, error, { 
      tenantId,
      title: req.body?.title 
    });
    return res
      .status(error.message === "This Course Is Already Available" ? 400 : 500)
      .json({
        message: error.message || "Internal Server Error, Please Try Again",
        success: false,
      });
  }
};

const allCourses = async (req, res) => {
  try {
    const { sortBy } = req.query;
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    logger.debug("Get all courses request", { userId, tenantId, sortBy });

    // tenantId comes from tenantScope middleware
    const courses = await courseService.getAllCourses(tenantId, sortBy);
    
    if (!courses || courses.length === 0) {
      logger.debug("No courses found", { tenantId });
      return res.status(200).json({
        message: "No Courses Found",
        success: true,
        data: [],
        count: 0,
      });
    }

    logger.logSuccess("Courses retrieved", userId, { 
      tenantId,
      count: courses.length,
      sortBy 
    });

    return res.status(200).json({
      message: "Courses Retrieved Successfully",
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    logger.logFailure("Get all courses", req.user?.id, error, { tenantId: req.tenantId });
    return res.status(500).json({
      message: "Internal Server Error, Please Try Again",
      success: false,
    });
  }
};

const allPlatformCourses = async (req, res) => {
  try {
    const { sortBy } = req.query;
    const userId = req.user?.id;

    logger.debug("Get platform courses request", { userId, sortBy });

    const courses = await courseService.getPlatformCourses(sortBy);

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        message: "No Courses Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Platform courses retrieved successfully",
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    logger.logFailure("Get platform courses", req.user?.id, error);
    return res.status(500).json({
      message: "Internal Server Error, Please Try Again",
      success: false,
    });
  }
};

const DeleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const tenantId = req.tenantId;

    logger.info("Course deletion attempt", { courseId: id, userId, tenantId });

    // Check course exists and user owns it
    const course = await Course.findOne({
      _id: id,
      $or: [{ tenantId }, { organization_id: tenantId }],
    });
    if (!course) {
      logger.warn("Course deletion failed: Course not found", { courseId: id, tenantId });
      return res.status(404).json({
        message: "Course Not Found",
        success: false,
      });
    }

    // Check ownership: only creator or admin/superadmin can delete
    const isOwner = course.createdBy.toString() === userId;
    const isAdmin = req.user.userType === "admin" || req.user.userType === "superadmin";

    if (!isOwner && !isAdmin) {
      logger.logSecurity("Unauthorized course deletion attempt", "medium", { 
        courseId: id,
        userId,
        ownerId: course.createdBy 
      });
      return res.status(403).json({
        message: "You can only delete your own courses",
        success: false,
      });
    }

    const deletedCourse = await courseService.deleteCourse(id, tenantId);

    logger.logSuccess("Course deleted", userId, { 
      courseId: id,
      title: course.title,
      tenantId 
    });

    return res.status(200).json({
      message: "Course Deleted Successfully",
      success: true,
      data: deletedCourse,
    });
  } catch (error) {
    logger.logFailure("Course deletion", req.user?.id, error, { 
      courseId: req.params.id,
      tenantId: req.tenantId 
    });
    return res.status(error.message === "Course Not Found" ? 404 : 400).json({
      message: error.message || "Internal Server Error, Please Try Again",
      success: false,
    });
  }
};

const getcourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id, req.tenantId);

    return res.status(200).json({
      message: "Course Retrieved Successfully",
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course by ID:", error.message);
    return res.status(error.message === "Course Not Found" ? 404 : 400).json({
      message: error.message || "Internal Server Error, Please Try Again",
      success: false,
    });
  }
};

const UpdateCourse = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Request body is empty or not properly parsed",
        success: false,
      });
    }

    const { id } = req.params;

    // Check course exists and user owns it
    const course = await Course.findOne({
      _id: id,
      $or: [{ tenantId: req.tenantId }, { organization_id: req.tenantId }],
    });
    if (!course) {
      return res.status(404).json({
        message: "Course Not Found",
        success: false,
      });
    }

    // Check ownership: only creator or admin/superadmin can update
    const isOwner = course.createdBy.toString() === req.user.id;
    const isAdmin = req.user.userType === "admin" || req.user.userType === "superadmin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only update your own courses",
        success: false,
      });
    }

    const updatedCourse = await courseService.updateCourse(id, req.tenantId, req.body);

    return res.status(200).json({
      message: "Course updated successfully",
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error.message);
    return res.status(error.message === "Course Not Found" ? 404 : 400).json({
      message: error.message || "Internal Server Error, Please Try Again",
      success: false,
    });
  }
};

module.exports = {
  CreateCourse,
  allCourses,
  allPlatformCourses,
  DeleteCourse,
  getcourseById,
  UpdateCourse,
};
