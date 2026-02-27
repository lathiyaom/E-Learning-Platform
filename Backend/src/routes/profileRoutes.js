const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { authenticate } = require("../middlewares/authMiddleware");

// All profile routes require authentication
router.use(authenticate);

// Get own profile
router.get("/me", profileController.getMe);

// Update profile
router.patch("/update", profileController.updateProfile);

// Change password
router.patch("/change-password", profileController.changePassword);

// Upload avatar
router.post("/upload-avatar", profileController.uploadAvatar);

// Get settings
router.get("/settings", profileController.getSettings);

// Update settings
router.patch("/settings", profileController.updateSettings);

module.exports = router;
