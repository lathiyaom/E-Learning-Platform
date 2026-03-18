const express = require("express");
const router = express.Router();
const holidayController = require("../controllers/holidayController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// Create holiday (admin only)
router.post("/create", authenticate, authorize("admin", "superadmin"), tenantScope, holidayController.createHoliday);

// Get all holidays
router.get("/all", authenticate, tenantScope, holidayController.getAllHolidays);

// Get upcoming holidays
router.get("/upcoming", authenticate, tenantScope, holidayController.getUpcomingHolidays);

// Get calendar holidays by year/month
router.get("/calendar/:year/:month", authenticate, tenantScope, holidayController.getCalendarHolidays);

// Get holiday by ID
router.get("/:id", authenticate, tenantScope, holidayController.getHolidayById);

// Update holiday (admin only)
router.patch("/:id", authenticate, authorize("admin", "superadmin"), tenantScope, holidayController.updateHoliday);

// Delete holiday (admin only)
router.delete("/:id", authenticate, authorize("admin", "superadmin"), tenantScope, holidayController.deleteHoliday);

module.exports = router;
