/**
 * Organization Controller - Handles teacher assignments and organization management
 */

const organizationService = require("../services/organizationService");
const TeacherOrganization = require("../models/TeacherOrganization.mongoose");
const User = require("../models/User.mongoose");
const Tenant = require("../models/Tenant.mongoose");
const { sendEmailNotification } = require("../services/notificationService");
const logger = require("../utils/logger");

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

// ✅ Get pending applications for organization
const getPendingApplications = async (req, res) => {
  try {
    const applications = await TeacherOrganization.find({
      organization_id: req.user.tenant_id,
      application_type: "application",
      status: "pending"
    })
    .populate("teacher_id", "firstName lastName email phoneNo experience specialization bio")
    .populate("applied_by", "firstName lastName email")
    .sort({ applied_at: -1 });

    res.status(200).json({
      success: true,
      message: "Pending applications fetched successfully",
      data: applications
    });
  } catch (error) {
    logger.error("Error fetching pending applications", error, { 
      organizationId: req.user.tenant_id 
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};

// ✅ Approve teacher application
const approveApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const organization_id = req.user.tenant_id;
    const admin_id = req.user._id;

    const application = await TeacherOrganization.findOne({
      _id: application_id,
      organization_id,
      application_type: "application",
      status: "pending"
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Update application status
    application.status = "approved";
    application.approved_by = admin_id;
    application.approved_at = new Date();
    await application.save();

    // Update teacher's organizations
    await User.findByIdAndUpdate(application.teacher_id, {
      $push: { organizations: organization_id },
      currentOrganization: organization_id
    });

    // Update organization's teachers
    await Tenant.findByIdAndUpdate(organization_id, {
      $push: { teachers: application.teacher_id }
    });

    // Get teacher and organization details for notification
    const teacher = await User.findById(application.teacher_id);
    const organization = await Tenant.findById(organization_id);

    // Send approval email to teacher
    try {
      await sendEmailNotification({
        to: teacher.email,
        subject: `Application Approved - Welcome to ${organization.name}!`,
        template: 'applicationApproved',
        data: {
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          organizationName: organization.name,
          organizationEmail: organization.email,
          approvedAt: new Date().toLocaleDateString(),
          adminName: `${req.user.firstName} ${req.user.lastName}`
        }
      });
    } catch (emailError) {
      logger.error("Failed to send approval email", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: application
    });
  } catch (error) {
    logger.error("Error approving application", error, { 
      organizationId: req.user.tenant_id, 
      applicationId: req.params.application_id 
    });
    res.status(500).json({
      success: false,
      message: "Failed to approve application",
      error: error.message
    });
  }
};

// ✅ Reject teacher application
const rejectApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const { rejection_reason } = req.body;
    const organization_id = req.user.tenant_id;
    const admin_id = req.user._id;

    const application = await TeacherOrganization.findOne({
      _id: application_id,
      organization_id,
      application_type: "application",
      status: "pending"
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Update application status
    application.status = "rejected";
    application.rejected_by = admin_id;
    application.rejected_at = new Date();
    application.rejection_reason = rejection_reason;
    await application.save();

    // Get teacher and organization details for notification
    const teacher = await User.findById(application.teacher_id);
    const organization = await Tenant.findById(organization_id);

    // Send rejection email to teacher
    try {
      await sendEmailNotification({
        to: teacher.email,
        subject: `Application Update - ${organization.name}`,
        template: 'applicationRejected',
        data: {
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          organizationName: organization.name,
          rejectionReason: rejection_reason || 'No reason provided',
          rejectedAt: new Date().toLocaleDateString(),
          adminName: `${req.user.firstName} ${req.user.lastName}`
        }
      });
    } catch (emailError) {
      logger.error("Failed to send rejection email", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: application
    });
  } catch (error) {
    logger.error("Error rejecting application", error, { 
      organizationId: req.user.tenant_id, 
      applicationId: req.params.application_id 
    });
    res.status(500).json({
      success: false,
      message: "Failed to reject application",
      error: error.message
    });
  }
};

// ✅ Invite teacher to organization
const inviteTeacher = async (req, res) => {
  try {
    const { teacher_id, invitation_message } = req.body;
    const organization_id = req.user.tenant_id;
    const admin_id = req.user._id;

    // Check if teacher exists and is available
    const teacher = await User.findOne({
      _id: teacher_id,
      userType: "teacher"
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // Check if already invited/joined
    const existingInvitation = await TeacherOrganization.findOne({
      teacher_id,
      organization_id,
      status: { $in: ["pending", "approved", "invited", "joined"] }
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: `Teacher already has a ${existingInvitation.status} relationship with this organization`
      });
    }

    // Create invitation
    const invitation = new TeacherOrganization({
      teacher_id,
      organization_id,
      application_type: "invitation",
      invited_by: admin_id,
      invitation_message,
      status: "invited",
      invited_at: new Date()
    });

    await invitation.save();

    // Get organization details for notification
    const organization = await Tenant.findById(organization_id);

    // Send invitation email to teacher
    try {
      await sendEmailNotification({
        to: teacher.email,
        subject: `Invitation to Join ${organization.name}`,
        template: 'teacherInvitation',
        data: {
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          organizationName: organization.name,
          organizationEmail: organization.email,
          invitationMessage: invitation_message || 'We would like to invite you to join our organization.',
          invitedAt: new Date().toLocaleDateString(),
          adminName: `${req.user.firstName} ${req.user.lastName}`
        }
      });
    } catch (emailError) {
      logger.error("Failed to send invitation email", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: invitation
    });
  } catch (error) {
    logger.error("Error inviting teacher", error, { 
      organizationId: req.user.tenant_id, 
      teacherId: req.body.teacher_id 
    });
    res.status(500).json({
      success: false,
      message: "Failed to send invitation",
      error: error.message
    });
  }
};

// ✅ Search available teachers to invite
const searchTeachers = async (req, res) => {
  try {
    const { search, specialization, experience } = req.query;
    const organization_id = req.user.tenant_id;

    // Build search criteria
    const searchCriteria = {
      userType: "teacher",
      available_for_org: true,
      // Exclude teachers already in organization or with pending applications
      _id: {
        $nin: await TeacherOrganization.find({
          organization_id,
          status: { $in: ["pending", "approved", "invited", "joined"] }
        }).distinct("teacher_id")
      }
    };

    if (search) {
      searchCriteria.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } }
      ];
    }

    if (specialization) {
      searchCriteria.specialization = { $regex: specialization, $options: "i" };
    }

    if (experience) {
      searchCriteria.experience = { $gte: parseInt(experience) };
    }

    const teachers = await User.find(searchCriteria)
      .select("firstName lastName email phoneNo experience specialization bio")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      message: "Teachers searched successfully",
      data: teachers,
      count: teachers.length
    });
  } catch (error) {
    logger.error("Error searching teachers", error, { 
      organizationId: req.user.tenant_id 
    });
    res.status(500).json({
      success: false,
      message: "Failed to search teachers",
      error: error.message
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
  getPendingApplications,
  approveApplication,
  rejectApplication,
  inviteTeacher,
  searchTeachers,
};
