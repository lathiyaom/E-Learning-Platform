const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passwordResetController = require("../controllers/passwordResetController");
const { authenticate } = require("../middlewares/authMiddleware");
const { validateUserLogin } = require("../middlewares/validation.middleware");

// ✅ Existing auth routes
router.post("/Login", validateUserLogin, authController.CreateLogin);
router.post("/Logout", authenticate, authController.LogOutController); // ✅ Require auth
router.post("/refresh-token", authController.RefreshToken);
router.get("/me", authenticate, authController.GetMe);

// ✅ Password reset routes - No authentication required
router.post("/forgot-password", passwordResetController.requestPasswordReset);
router.post("/verify-reset-token", passwordResetController.verifyResetToken);
router.get("/check-reset-token", passwordResetController.checkTokenValidity);
router.post("/reset-password", passwordResetController.resetPassword);

module.exports = router;
