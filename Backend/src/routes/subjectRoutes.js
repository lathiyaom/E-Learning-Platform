const express = require("express");
const router = express.Router();

const subjectController = require("../controllers/subjectController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

router.get(
  "/All",
  authenticate,
  tenantScope,
  authorize("admin", "teacher"),
  subjectController.getSubjects,
);

router.post(
  "/Create",
  authenticate,
  tenantScope,
  authorize("admin"),
  subjectController.createSubject,
);

router.patch(
  "/Update/:id",
  authenticate,
  tenantScope,
  authorize("admin"),
  subjectController.updateSubject,
);

router.patch(
  "/Archive/:id",
  authenticate,
  tenantScope,
  authorize("admin"),
  subjectController.archiveSubject,
);

router.patch(
  "/Restore/:id",
  authenticate,
  tenantScope,
  authorize("admin"),
  subjectController.restoreSubject,
);

router.delete(
  "/Delete/:id",
  authenticate,
  tenantScope,
  authorize("admin"),
  subjectController.deleteSubject,
);

module.exports = router;
