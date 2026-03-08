const TeacherOrganization = require("../models/TeacherOrganization.mongoose");
const User = require("../models/User.mongoose");
const Tenant = require("../models/Tenant.mongoose");
const { sendEmailNotification } = require("../services/notificationService");
const logger = require("../utils/logger");

class TeacherApplicationController {
  // Get all available organizations for teachers to browse
  async getOrganizations(req, res) {
    try {
      const organizations = await Tenant.find({
        status: "active",
        // Don't show organizations where teacher is already applied/joined
        $nor: [
          { _id: { $in: req.user.organizations || [] } },
          {
            _id: {
              $in: await TeacherOrganization.find({
                teacher_id: req.user._id,
                status: { $in: ["pending", "approved", "invited", "joined"] }
              }).distinct("organization_id")
            }
          }
        ]
      })
      .select("name email phoneNo OrgOwnerName OrgOwnerEmail description industry sector")
      .lean();

      res.status(200).json({
        success: true,
        message: "Organizations fetched successfully",
        data: organizations,
        count: organizations.length
      });
    } catch (error) {
      logger.error("Error fetching organizations", error, { userId: req.user._id });
      res.status(500).json({
        success: false,
        message: "Failed to fetch organizations",
        error: error.message
      });
    }
  }

  // Apply to an organization
  async applyToOrganization(req, res) {
    try {
      const { organization_id, application_message } = req.body;
      const teacher_id = req.user._id;

      // Check if already applied/joined
      const existingApplication = await TeacherOrganization.findOne({
        teacher_id,
        organization_id,
        status: { $in: ["pending", "approved", "invited", "joined"] }
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: `You already have a ${existingApplication.status} application with this organization`
        });
      }

      // Create application
      const application = new TeacherOrganization({
        teacher_id,
        organization_id,
        application_type: "application",
        applied_by: teacher_id,
        application_message,
        status: "pending"
      });

      await application.save();

      // Get organization and teacher details for notification
      const organization = await Tenant.findById(organization_id);
      const teacher = await User.findById(teacher_id);

      // Send email notification to organization owner
      try {
        await sendEmailNotification({
          to: organization.OrgOwnerEmail,
          subject: `New Teacher Application - ${teacher.firstName} ${teacher.lastName}`,
          template: 'teacherApplication',
          data: {
            teacherName: `${teacher.firstName} ${teacher.lastName}`,
            teacherEmail: teacher.email,
            teacherPhone: teacher.phoneNo,
            organizationName: organization.name,
            applicationMessage: application_message || 'No message provided',
            appliedAt: new Date().toLocaleDateString()
          }
        });
      } catch (emailError) {
        logger.error("Failed to send application email", emailError);
      }

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application
      });
    } catch (error) {
      logger.error("Error applying to organization", error, { 
        userId: req.user._id, 
        organizationId: req.body.organization_id 
      });
      res.status(500).json({
        success: false,
        message: "Failed to submit application",
        error: error.message
      });
    }
  }

  // Get teacher's applications
  async getMyApplications(req, res) {
    try {
      const applications = await TeacherOrganization.find({
        teacher_id: req.user._id,
        application_type: "application"
      })
      .populate("organization_id", "name email OrgOwnerName OrgOwnerEmail")
      .sort({ applied_at: -1 });

      res.status(200).json({
        success: true,
        message: "Applications fetched successfully",
        data: applications
      });
    } catch (error) {
      logger.error("Error fetching applications", error, { userId: req.user._id });
      res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
        error: error.message
      });
    }
  }

  // Get teacher's invitations
  async getMyInvitations(req, res) {
    try {
      const invitations = await TeacherOrganization.find({
        teacher_id: req.user._id,
        application_type: "invitation",
        status: "invited"
      })
      .populate("organization_id", "name email OrgOwnerName OrgOwnerEmail")
      .populate("invited_by", "firstName lastName email")
      .sort({ invited_at: -1 });

      res.status(200).json({
        success: true,
        message: "Invitations fetched successfully",
        data: invitations
      });
    } catch (error) {
      logger.error("Error fetching invitations", error, { userId: req.user._id });
      res.status(500).json({
        success: false,
        message: "Failed to fetch invitations",
        error: error.message
      });
    }
  }

  // Accept invitation
  async acceptInvitation(req, res) {
    try {
      const { application_id } = req.params;
      const teacher_id = req.user._id;

      const invitation = await TeacherOrganization.findOne({
        _id: application_id,
        teacher_id,
        application_type: "invitation",
        status: "invited"
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found"
        });
      }

      // Update invitation status
      invitation.status = "joined";
      invitation.joined_at = new Date();
      await invitation.save();

      // Update user's organizations
      await User.findByIdAndUpdate(teacher_id, {
        $push: { organizations: invitation.organization_id },
        currentOrganization: invitation.organization_id
      });

      // Update organization's teachers
      await Tenant.findByIdAndUpdate(invitation.organization_id, {
        $push: { teachers: teacher_id }
      });

      // Get organization details for notification
      const organization = await Tenant.findById(invitation.organization_id);

      // Send confirmation email
      try {
        await sendEmailNotification({
          to: req.user.email,
          subject: `Welcome to ${organization.name}!`,
          template: 'teacherWelcome',
          data: {
            teacherName: `${req.user.firstName} ${req.user.lastName}`,
            organizationName: organization.name,
            joinedAt: new Date().toLocaleDateString()
          }
        });
      } catch (emailError) {
        logger.error("Failed to send welcome email", emailError);
      }

      res.status(200).json({
        success: true,
        message: "Invitation accepted successfully",
        data: invitation
      });
    } catch (error) {
      logger.error("Error accepting invitation", error, { 
        userId: req.user._id, 
        applicationId: req.params.application_id 
      });
      res.status(500).json({
        success: false,
        message: "Failed to accept invitation",
        error: error.message
      });
    }
  }

  // Reject invitation
  async rejectInvitation(req, res) {
    try {
      const { application_id } = req.params;
      const teacher_id = req.user._id;

      const invitation = await TeacherOrganization.findOne({
        _id: application_id,
        teacher_id,
        application_type: "invitation",
        status: "invited"
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found"
        });
      }

      // Update invitation status
      invitation.status = "rejected";
      invitation.rejected_by = teacher_id;
      invitation.rejected_at = new Date();
      await invitation.save();

      res.status(200).json({
        success: true,
        message: "Invitation rejected successfully",
        data: invitation
      });
    } catch (error) {
      logger.error("Error rejecting invitation", error, { 
        userId: req.user._id, 
        applicationId: req.params.application_id 
      });
      res.status(500).json({
        success: false,
        message: "Failed to reject invitation",
        error: error.message
      });
    }
  }

  // Leave organization
  async leaveOrganization(req, res) {
    try {
      const { organization_id } = req.params;
      const teacher_id = req.user._id;

      const membership = await TeacherOrganization.findOne({
        teacher_id,
        organization_id,
        status: "joined"
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: "You are not a member of this organization"
        });
      }

      // Update membership status
      membership.status = "left";
      membership.left_at = new Date();
      await membership.save();

      // Update user's organizations
      await User.findByIdAndUpdate(teacher_id, {
        $pull: { organizations: organization_id }
      });

      // Update organization's teachers
      await Tenant.findByIdAndUpdate(organization_id, {
        $pull: { teachers: teacher_id }
      });

      res.status(200).json({
        success: true,
        message: "Left organization successfully",
        data: membership
      });
    } catch (error) {
      logger.error("Error leaving organization", error, { 
        userId: req.user._id, 
        organizationId: req.params.organization_id 
      });
      res.status(500).json({
        success: false,
        message: "Failed to leave organization",
        error: error.message
      });
    }
  }
}

module.exports = new TeacherApplicationController();
