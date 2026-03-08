const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticate, authorize, isTenantOwner } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// Create event (admin only)
router.post("/create", authenticate, isTenantOwner, authorize("admin"), tenantScope, eventController.createEvent);

// Get all events
router.get("/all", authenticate, tenantScope, eventController.getAllEvents);

// Get upcoming events
router.get("/upcoming", authenticate, tenantScope, eventController.getUpcomingEvents);

// Get event by ID
router.get("/:id", authenticate, tenantScope, eventController.getEventById);

// Register for event
router.post("/:id/register", authenticate, tenantScope, eventController.registerForEvent);

// Unregister from event
router.post("/:id/unregister", authenticate, tenantScope, eventController.unregisterFromEvent);

// Update event (admin only)
router.patch("/:id", authenticate, isTenantOwner, authorize("admin"), tenantScope, eventController.updateEvent);

// Delete event (admin only)
router.delete("/:id", authenticate, isTenantOwner, authorize("admin"), tenantScope, eventController.deleteEvent);

module.exports = router;
