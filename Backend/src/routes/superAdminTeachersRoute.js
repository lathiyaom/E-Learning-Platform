const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Get all teachers on the platform (SuperAdmin only)
router.get("/Teachers", authenticate, authorize("superadmin"), async (req, res) => {
  try {
    const teachers = await User.find({ 
      userType: "teacher" 
    })
    .select("-password -token -refreshToken")
    .populate('organizations', 'name')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teachers,
      count: teachers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message
    });
  }
});

module.exports = router;
