const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { authorize, authenticate } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

router.post(
  "/Create",
  authenticate,
  tenantScope,
  authorize("teacher"),
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
  authenticate,
  authorize("student", "admin", "teacher", "superadmin"),
  courseController.allPlatformCourses
);

router.get(
  "/:id",
  authenticate,
  tenantScope,
  courseController.getcourseById
);

router.patch(
  "/Update/:id",
  authenticate,
  tenantScope,
  authorize("teacher"),
  courseController.UpdateCourse,
);

router.delete(
  "/Delete/:id",
  authenticate,
  tenantScope,
  authorize("teacher"),
  courseController.DeleteCourse,
);

module.exports = router;
