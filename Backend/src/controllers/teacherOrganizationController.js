/**
 * Teacher Multi-Organization Controller
 */

const teacherOrganizationService = require("../services/teacherOrganizationService");

const teacherOrganizationController = {
  /**
   * GET /Teacher/unassigned - Get all unassigned teachers (admin/superadmin only)
   */
  getUnassignedTeachers: async (req, res) => {
    try {
      const teachers = await teacherOrganizationService.getUnassignedTeachers();

      return res.status(200).json({
        success: true,
        message: "Unassigned teachers retrieved successfully",
        data: teachers,
        count: teachers.length,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * GET /Teacher/organization/:tenantId - Get all teachers for an organization
   */
  getOrganizationTeachers: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const teachers = await teacherOrganizationService.getOrganizationTeachers(tenantId);

      return res.status(200).json({
        success: true,
        message: "Organization teachers retrieved successfully",
        data: teachers,
        count: teachers.length,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * POST /Teacher/assign - Assign multiple teachers to organization
   */
  assignTeachersToOrganization: async (req, res) => {
    try {
      const { teacherIds } = req.body;
      const tenantId = req.tenantId; // From tenantScope middleware

      if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "teacherIds array is required",
        });
      }

      const result = await teacherOrganizationService.assignTeachersToOrganization(
        tenantId,
        teacherIds
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * DELETE /Teacher/remove/:teacherId - Remove teacher from organization
   */
  removeTeacherFromOrganization: async (req, res) => {
    try {
      const { teacherId } = req.params;
      const tenantId = req.tenantId;

      const result = await teacherOrganizationService.removeTeacherFromOrganization(
        tenantId,
        teacherId
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * GET /Teacher/my-organizations - Get all organizations for logged-in teacher
   */
  getMyOrganizations: async (req, res) => {
    try {
      const teacherId = req.user.id;

      const result = await teacherOrganizationService.getTeacherOrganizations(teacherId);

      return res.status(200).json({
        success: true,
        message: "Organizations retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * POST /Teacher/switch-organization - Switch teacher's current organization
   */
  switchOrganization: async (req, res) => {
    try {
      const teacherId = req.user.id;
      const { organizationId } = req.body;

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: "organizationId is required",
        });
      }

      const result = await teacherOrganizationService.switchOrganization(
        teacherId,
        organizationId
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * GET /Teacher/org-stats - Get teacher's statistics for current organization
   */
  getOrgStats: async (req, res) => {
    try {
      const teacherId = req.user.id;
      const organizationId = req.query.organizationId || req.user.currentOrganization;

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: "No organization selected",
        });
      }

      const stats = await teacherOrganizationService.getTeacherOrgStats(
        teacherId,
        organizationId
      );

      return res.status(200).json({
        success: true,
        message: "Statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * GET /Teacher/org-data/:dataType - Get organization-specific data
   */
  getOrgData: async (req, res) => {
    try {
      const teacherId = req.user.id;
      const { dataType } = req.params;
      const organizationId = req.query.organizationId || req.user.currentOrganization;

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: "No organization selected",
        });
      }

      const data = await teacherOrganizationService.getTeacherOrgData(
        teacherId,
        organizationId,
        dataType
      );

      return res.status(200).json({
        success: true,
        message: `${dataType} retrieved successfully`,
        data,
        count: data.length,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = teacherOrganizationController;
