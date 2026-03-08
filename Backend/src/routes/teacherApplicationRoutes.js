const express = require("express");
const router = express.Router();
const teacherApplicationController = require("../controllers/teacherApplicationController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Teacher routes
router.get(
  "/organizations",
  authenticate,
  authorize("teacher"),
  teacherApplicationController.getOrganizations
);

router.post(
  "/apply/:organization_id",
  authenticate,
  authorize("teacher"),
  teacherApplicationController.applyToOrganization
);

router.get(
  "/applications",
  authenticate,
  authorize("teacher"),
  teacherApplicationController.getMyApplications
);

router.get(
  "/invitations",
  authenticate,
  authorize("teacher"),
  teacherApplicationController.getMyInvitations
);

router.post(
  "/accept-invitation/:application_id",
  authenticate,
  authorize("teacher"),
  teacherApplicationController.acceptInvitation
);

router.post(
  "/reject-invitation/:application_id",
  authenticate,
  authorize("teacher"),
  teacherApplicationController.rejectInvitation
);

router.post(
  "/leave/:organization_id",
  authenticate,
  authorize("teacher"),
  teacherApplicationController.leaveOrganization
);

module.exports = router;
