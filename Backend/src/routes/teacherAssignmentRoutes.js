const express = require("express");
const router = express.Router();
const { User, Tenant, TeacherOrganization } = require("../models");
const { authenticate, authorize, isTenantOwner } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// Assign teacher to organization
router.post("/assign-teacher", authenticate, isTenantOwner, authorize("admin"), tenantScope, async (req, res) => {
  try {
    const { teacher_id } = req.body;
    const adminId = req.user.id;
    const organizationId = req.tenantId;

    // Verify teacher exists and is available
    const teacher = await User.findById(teacher_id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    if (teacher.userType !== "teacher") {
      return res.status(400).json({
        success: false,
        message: "User is not a teacher"
      });
    }

    if (!teacher.available_for_org) {
      return res.status(400).json({
        success: false,
        message: "Teacher is not available for organization assignment"
      });
    }

    // Check if teacher is already assigned to another organization
    const existingAssignment = await TeacherOrganization.findOne({
      teacher_id: teacher_id,
      status: "active"
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Teacher is already assigned to an organization"
      });
    }

    // Create TeacherOrganization entry
    const assignment = new TeacherOrganization({
      teacher_id: teacher_id,
      organization_id: organizationId,
      assigned_by_admin: adminId,
      status: "active"
    });

    await assignment.save();

    // Update teacher's organizations array
    teacher.organizations.push(organizationId);
    teacher.currentOrganization = organizationId;
    teacher.available_for_org = false; // Mark as unavailable for other orgs
    await teacher.save();

    res.status(201).json({
      success: true,
      message: "Teacher assigned successfully",
      data: {
        teacher_id: teacher_id,
        organization_id: organizationId,
        teacher_name: `${teacher.firstName} ${teacher.lastName}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign teacher",
      error: error.message
    });
  }
});

// Get available teachers for assignment
router.get("/available-teachers", authenticate, isTenantOwner, authorize("admin"), tenantScope, async (req, res) => {
  try {
    const availableTeachers = await User.find({
      userType: "teacher",
      available_for_org: true,
      $or: [
        { organizations: { $size: 0 } },
        { organizations: { $exists: false } }
      ]
    })
    .select("-password -token -refreshToken")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: availableTeachers,
      count: availableTeachers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch available teachers",
      error: error.message
    });
  }
});

// Get assigned teachers for current organization
router.get("/assigned-teachers", authenticate, isTenantOwner, authorize("admin"), tenantScope, async (req, res) => {
  try {
    const assignedTeachers = await TeacherOrganization.find({
      organization_id: req.tenantId,
      status: "active"
    })
    .populate('teacher_id', 'firstName lastName email phoneNo')
    .populate('assigned_by_admin', 'firstName lastName email')
    .sort({ assigned_at: -1 });

    res.status(200).json({
      success: true,
      data: assignedTeachers,
      count: assignedTeachers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned teachers",
      error: error.message
    });
  }
});

// Remove teacher assignment
router.delete("/remove-teacher/:teacherId", authenticate, isTenantOwner, authorize("admin"), tenantScope, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const organizationId = req.tenantId;

    // Find and remove assignment
    const assignment = await TeacherOrganization.findOneAndDelete({
      teacher_id: teacherId,
      organization_id: organizationId,
      status: "active"
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Teacher assignment not found"
      });
    }

    // Update teacher
    const teacher = await User.findById(teacherId);
    if (teacher) {
      teacher.organizations = teacher.organizations.filter(org => !org.equals(organizationId));
      if (teacher.currentOrganization && teacher.currentOrganization.equals(organizationId)) {
        teacher.currentOrganization = teacher.organizations.length > 0 ? teacher.organizations[0] : null;
      }
      teacher.available_for_org = true; // Make available again
      await teacher.save();
    }

    res.status(200).json({
      success: true,
      message: "Teacher removed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove teacher",
      error: error.message
    });
  }
});

module.exports = router;
