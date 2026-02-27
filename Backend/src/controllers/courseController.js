const courseService = require("../services/courseService");
const { Course } = require("../models");

const CreateCourse = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Request body is empty or not properly parsed",
        success: false,
      });
    }

    // Add tenantId and createdBy from authenticated user
    const courseData = {
      ...req.body,
      createdBy: req.user.id,
      // For tenant users: use their tenantId, for standalone teachers: use req.user.tenantId
      tenantId: req.user.role === "tenant" ? req.user.id : req.user.tenantId,
    };

    const newCourse = await courseService.createCourse(courseData);

    return res.status(200).json({
      message: "The Course Successfully Added",
      success: true,
      data: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error.message);
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

    // tenantId comes from tenantScope middleware
    const courses = await courseService.getAllCourses(req.tenantId, sortBy);
    if (!courses || courses.length === 0) {
      return res.status(404).json({
        message: "No Courses Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Courses Retrieved Successfully",
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    return res.status(500).json({
      message: "Internal Server Error, Please Try Again",
      success: false,
    });
  }
};

const DeleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check course exists and user owns it
    const course = await Course.findOne({ _id: id, tenantId: req.tenantId });
    if (!course) {
      return res.status(404).json({
        message: "Course Not Found",
        success: false,
      });
    }

    // Check ownership: only creator or admin/superadmin can delete
    const isOwner = course.createdBy.toString() === req.user.id;
    const isAdmin = req.user.userType === "admin" || req.user.userType === "superadmin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only delete your own courses",
        success: false,
      });
    }

    const deletedCourse = await courseService.deleteCourse(id, req.tenantId);

    return res.status(200).json({
      message: "Course Deleted Successfully",
      success: true,
      data: deletedCourse,
    });
  } catch (error) {
    console.error("Error deleting course:", error.message);
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
    const course = await Course.findOne({ _id: id, tenantId: req.tenantId });
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
  DeleteCourse,
  getcourseById,
  UpdateCourse,
};
