const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");
const feedbackController = require("../controllers/feedbackController");

// Create feedback
router.post(
  "/create",
  authenticate,
  tenantScope,
  authorize("student"),
  feedbackController.createFeedback
);

// Get course feedback
router.get(
  "/course/:courseId",
  authenticate,
  tenantScope,
  feedbackController.getCourseFeedback
);

// Get user feedback
router.get(
  "/user/:reviewerId",
  authenticate,
  tenantScope,
  feedbackController.getUserFeedback
);

// Update feedback
router.patch(
  "/:id",
  authenticate,
  tenantScope,
  authorize("admin", "superadmin"),
  feedbackController.updateFeedback
);

// Delete feedback
router.delete(
  "/:id",
  authenticate,
  tenantScope,
  authorize("admin", "superadmin"),
  feedbackController.deleteFeedback
);

module.exports = router;
