const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");
const { authenticate } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// All timetable routes require authentication
router.use(authenticate);
router.use(tenantScope);

// Create timetable entry
router.post("/create", timetableController.createTimetable);

// Get course timetable
router.get("/course/:courseId", timetableController.getCourseTimetable);

// Get user's schedule
router.get("/my-schedule", timetableController.getMySchedule);

// Get today's schedule
router.get("/today", timetableController.getTodaySchedule);

// Get week schedule
router.get("/week", timetableController.getWeekSchedule);

// Update timetable
router.patch("/update/:id", timetableController.updateTimetable);

// Delete timetable
router.delete("/delete/:id", timetableController.deleteTimetable);

module.exports = router;
