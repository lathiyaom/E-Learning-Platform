const express = require("express");
const router = express.Router();
const holidayController = require("../controllers/holidayController");
const { authenticate } = require("../middlewares/authMiddleware");

// All holiday routes require authentication
router.use(authenticate);

// Create holiday (admin/superadmin only)
router.post("/create", holidayController.createHoliday);

// Get all holidays
router.get("/all", holidayController.getAllHolidays);

// Get upcoming holidays
router.get("/upcoming", holidayController.getUpcomingHolidays);

// Get holiday by ID
router.get("/:id", holidayController.getHolidayById);

// Update holiday (admin/superadmin only)
router.patch("/update/:id", holidayController.updateHoliday);

// Delete holiday (admin/superadmin only)
router.delete("/delete/:id", holidayController.deleteHoliday);

module.exports = router;
