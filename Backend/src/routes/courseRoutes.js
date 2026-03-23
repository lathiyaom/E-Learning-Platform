const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { authorize, authenticate, optionalAuth } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

router.post(
  "/Create",
  authenticate,
  tenantScope,
  authorize("teacher", "admin", "superadmin"),
  courseController.CreateCourse,
);

router.get(
  "/All",
  authenticate,
  tenantScope,
  courseController.allCourses
);

router.get(
  "/Marketplace",
  optionalAuth,
  courseController.allPlatformCourses
);

router.get(
  "/:id",
  optionalAuth,
  courseController.getcourseById
);

router.patch(
  "/Update/:id",
  authenticate,
  tenantScope,
  authorize("teacher", "admin", "superadmin"),
  courseController.UpdateCourse,
);

router.delete(
  "/Delete/:id",
  authenticate,
  tenantScope,
  authorize("teacher", "admin", "superadmin"),
  courseController.DeleteCourse,
);

module.exports = router;
