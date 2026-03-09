const express = require("express");
const router = express.Router();
const lectureController = require("../controllers/lectureController");
const { authenticate } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// All lecture routes require authentication
router.use(authenticate);
router.use(tenantScope);

// Create lecture (POST)
router.post("/create", lectureController.createLecture);

// Get all lectures for a course (must be before /:id to avoid "course" being parsed as id)
router.get("/course/:courseId", lectureController.getLecturesByCourse);

// Get today's lectures (must be before /:id to avoid "today" being parsed as id)
router.get("/today", lectureController.getTodayLectures);

// Get upcoming lectures (must be before /:id to avoid "upcoming" being parsed as id)
router.get("/upcoming", lectureController.getUpcomingLectures);

// Get lecture by ID (declared after specific paths to prevent shadowing)
router.get("/:id", lectureController.getLectureById);

// Update lecture
router.patch("/update/:id", lectureController.updateLecture);

// Update lecture status
router.patch("/status/:id", lectureController.updateLectureStatus);

// Delete lecture (admin only)
router.delete("/delete/:id", lectureController.deleteLecture);

// Add lecture material
router.post("/:id/materials", lectureController.addLectureMaterial);

// Remove lecture material
router.delete("/:id/materials/:materialIndex", lectureController.removeLectureMaterial);

module.exports = router;
