/**
 * Organization Controller - Handles teacher assignments and organization management
 */

const organizationService = require("../services/organizationService");

// ✅ Get unassigned teachers (admin only)
const getUnassignedTeachers = async (req, res) => {
  try {
    const teachers = await organizationService.getUnassignedTeachers();

    res.status(200).json({
      message: "Unassigned teachers retrieved successfully",
      success: true,
      data: teachers,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to fetch unassigned teachers",
      success: false,
    });
  }
};

// ✅ Get all teachers for organization admin (assigned + unassigned)
const getAllTeachersForAdmin = async (req, res) => {
  try {
    const tenantId = req.user.id; // Tenant admin's own ID
    const teachers = await organizationService.getAllTeachersForAdmin(tenantId);

    res.status(200).json({
      message: "Teachers retrieved successfully",
      success: true,
      data: teachers,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to fetch teachers",
      success: false,
    });
  }
};

// ✅ Assign multiple teachers to organization
const assignTeachersToOrganization = async (req, res) => {
  try {
    const { teacherIds } = req.body;

    if (!teacherIds) {
      return res.status(400).json({
        message: "Teacher IDs array is required",
        success: false,
      });
    }

    const tenantId = req.user.id; // Organization admin's ID
    const result = await organizationService.assignTeachersToOrganization(
      tenantId,
      teacherIds
    );

    res.status(200).json({
      message: result.message,
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to assign teachers",
      success: false,
    });
  }
};

// ✅ Get teacher's organizations
const getTeacherOrganizations = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const orgs = await organizationService.getTeacherOrganizations(teacherId);

    res.status(200).json({
      message: "Teacher organizations retrieved successfully",
      success: true,
      data: orgs,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to fetch organizations",
      success: false,
    });
  }
};

// ✅ Switch teacher's current organization
const switchTeacherOrganization = async (req, res) => {
  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({
        message: "Organization ID is required",
        success: false,
      });
    }

    const teacherId = req.user.id;
    const result = await organizationService.switchTeacherOrganization(
      teacherId,
      organizationId
    );

    res.status(200).json({
      message: result.message,
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to switch organization",
      success: false,
    });
  }
};

// ✅ Remove teacher from organization
const removeTeacherFromOrganization = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        message: "Teacher ID is required",
        success: false,
      });
    }

    const tenantId = req.user.id; // Organization admin's ID
    const result = await organizationService.removeTeacherFromOrganization(
      tenantId,
      teacherId
    );

    res.status(200).json({
      message: result.message,
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to remove teacher",
      success: false,
    });
  }
};

// ✅ Get organization's isolated data (courses, students, events for teacher)
const getOrganizationData = async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({
        message: "Organization ID is required",
        success: false,
      });
    }

    const teacherId = req.user.id;
    const data = await organizationService.getOrganizationDataForTeacher(
      teacherId,
      organizationId
    );

    res.status(200).json({
      message: "Organization data retrieved successfully",
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to fetch organization data",
      success: false,
    });
  }
};

module.exports = {
  getUnassignedTeachers,
  getAllTeachersForAdmin,
  assignTeachersToOrganization,
  getTeacherOrganizations,
  switchTeacherOrganization,
  removeTeacherFromOrganization,
  getOrganizationData,
};
