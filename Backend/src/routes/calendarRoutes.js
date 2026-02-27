const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const { authenticate } = require("../middlewares/authMiddleware");

// All calendar routes require authentication
router.use(authenticate);

// Get month calendar
router.get("/month/:year/:month", calendarController.getMonthCalendar);

// Get week calendar
router.get("/week", calendarController.getWeekCalendar);

// Get today's calendar
router.get("/today", calendarController.getTodayCalendar);

// Get upcoming events
router.get("/upcoming/:days", calendarController.getUpcomingCalendar);

module.exports = router;
