const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticate } = require("../middlewares/authMiddleware");

// All event routes require authentication
router.use(authenticate);

// Create event (admin only)
router.post("/create", eventController.createEvent);

// Get all events
router.get("/all", eventController.getAllEvents);

// Get event by ID
router.get("/:id", eventController.getEventById);

// Get upcoming events
router.get("/upcoming", eventController.getUpcomingEvents);

// Register for event
router.post("/register/:id", eventController.registerForEvent);

// Unregister from event
router.post("/unregister/:id", eventController.unregisterFromEvent);

// Update event (admin only)
router.patch("/update/:id", eventController.updateEvent);

// Delete event (admin only)
router.delete("/delete/:id", eventController.deleteEvent);

module.exports = router;
