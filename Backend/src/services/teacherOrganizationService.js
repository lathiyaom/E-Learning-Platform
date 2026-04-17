/**
 * Teacher Multi-Organization Service
 * Handles teacher assignment to multiple organizations and organization switching
 */

const { User, Tenant, Course, Enrollment, Attendance, Rating, Feedback } = require("../models");
const crypto = require("crypto");
const { sendTeacherInvitationEmail } = require("../utils/emailService");

const getInvitationFrontendUrl = () => process.env.FRONTEND_INVITATION_URL || "http://localhost:3000";

const teacherOrganizationService = {
  /**
   * Get all unassigned teachers (no organizations)
   */
  getUnassignedTeachers: async () => {
    try {
      const teachers = await User.find({
        userType: "teacher",
        $or: [
          { organizations: { $exists: false } },
          { organizations: { $size: 0 } },
        ],
        status: "active",
      }).select("-password -token -refreshToken");

      return teachers;
    } catch (error) {
      throw new Error(`Failed to get unassigned teachers: ${error.message}`);
    }
  },

  /**
   * Get all teachers for an organization (admin view)
   */
  getOrganizationTeachers: async (tenantId) => {
    try {
      const teachers = await User.find({
        userType: "teacher",
        organizations: tenantId,
        status: "active",
      }).select("-password -token -refreshToken");

      return teachers;
    } catch (error) {
      throw new Error(`Failed to get organization teachers: ${error.message}`);
    }
  },

  /**
   * Send invitations to multiple teachers for an organization.
   * Teachers are assigned only after accepting the email invitation.
   */
  assignTeachersToOrganization: async (tenantId, teacherIds) => {
    try {
      // Verify tenant exists
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        throw new Error("Organization not found");
      }

      // Verify all teachers exist and are teachers
      const teachers = await User.find({
        _id: { $in: teacherIds },
        userType: "teacher",
      });

      if (teachers.length !== teacherIds.length) {
        throw new Error("Some teachers not found or invalid");
      }

      const admin = await Tenant.findById(tenantId).select("name institutionName");
      const frontendUrl = getInvitationFrontendUrl();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      let invitedCount = 0;
      const skipped = [];

      for (const teacher of teachers) {
        const alreadyAssigned = Array.isArray(teacher.organizations)
          && teacher.organizations.some((orgId) => orgId.toString() === tenantId.toString());

        if (alreadyAssigned) {
          skipped.push({
            id: teacher._id,
            email: teacher.email,
            reason: "already_assigned",
          });
          continue;
        }

        const hasActiveInvite = teacher.pendingOrgInvitation?.token
          && teacher.pendingOrgInvitation?.expiresAt
          && new Date(teacher.pendingOrgInvitation.expiresAt) > now;

        if (hasActiveInvite) {
          skipped.push({
            id: teacher._id,
            email: teacher.email,
            reason: "already_has_pending_invitation",
          });
          continue;
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        teacher.pendingOrgInvitation = {
          token: hashedToken,
          organizationId: tenantId,
          invitedBy: tenantId,
          expiresAt,
        };

        await teacher.save({ validateBeforeSave: false });

        const acceptLink = `${frontendUrl}/teacher/invitation/${rawToken}/accept`;
        const rejectLink = `${frontendUrl}/teacher/invitation/${rawToken}/reject`;

        await sendTeacherInvitationEmail({
          email: teacher.email,
          teacherName: `${teacher.firstName} ${teacher.lastName}`.trim(),
          organizationName: tenant.institutionName || tenant.name,
          adminName: admin?.institutionName || admin?.name || "Organization Admin",
          acceptLink,
          rejectLink,
        });

        invitedCount += 1;
      }

      return {
        message: `${invitedCount} invitation(s) sent successfully`,
        invitedCount,
        skipped,
        teachers: teachers.map((t) => ({
          id: t._id,
          name: `${t.firstName} ${t.lastName}`,
          email: t.email,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to assign teachers: ${error.message}`);
    }
  },

  /**
   * Remove teacher from organization
   */
  removeTeacherFromOrganization: async (tenantId, teacherId) => {
    try {
      const teacher = await User.findOne({
        _id: teacherId,
        userType: "teacher",
      });

      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Remove organization from array
      teacher.organizations = teacher.organizations.filter(
        org => org.toString() !== tenantId.toString()
      );

      // If current organization was removed, switch to first available
      if (teacher.currentOrganization?.toString() === tenantId.toString()) {
        teacher.currentOrganization = teacher.organizations[0] || null;
      }

      await teacher.save();

      return {
        message: "Teacher removed from organization",
        teacher: {
          id: teacher._id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          remainingOrganizations: teacher.organizations.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to remove teacher: ${error.message}`);
    }
  },

  /**
   * Get all organizations for a teacher
   */
  getTeacherOrganizations: async (teacherId) => {
    try {
      const teacher = await User.findOne({
        _id: teacherId,
        userType: "teacher",
      }).populate("organizations", "name email status OrgOwnerName");

      if (!teacher) {
        throw new Error("Teacher not found");
      }

      return {
        currentOrganization: teacher.currentOrganization,
        organizations: teacher.organizations || [],
        totalOrganizations: teacher.organizations?.length || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get teacher organizations: ${error.message}`);
    }
  },

  /**
   * Switch teacher's current organization
   */
  switchOrganization: async (teacherId, newOrganizationId) => {
    try {
      const teacher = await User.findOne({
        _id: teacherId,
        userType: "teacher",
      });

      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Verify teacher is assigned to this organization
      const isAssigned = teacher.organizations.some(
        org => org.toString() === newOrganizationId.toString()
      );

      if (!isAssigned) {
        throw new Error("Teacher is not assigned to this organization");
      }

      teacher.currentOrganization = newOrganizationId;
      await teacher.save();

      const organization = await Tenant.findById(newOrganizationId).select("name email");

      return {
        message: "Organization switched successfully",
        currentOrganization: {
          id: organization._id,
          name: organization.name,
          email: organization.email,
        },
      };
    } catch (error) {
      throw new Error(`Failed to switch organization: ${error.message}`);
    }
  },

  /**
   * Get teacher's organization-specific statistics
   */
  getTeacherOrgStats: async (teacherId, organizationId) => {
    try {
      // Get courses taught by teacher in this organization
      const courses = await Course.find({
        tenantId: organizationId,
        createdBy: teacherId,
      });

      const courseIds = courses.map(c => c._id);

      // Get total students enrolled in teacher's courses
      const enrollments = await Enrollment.countDocuments({
        tenantId: organizationId,
        courseId: { $in: courseIds },
        status: "active",
      });

      // Get average rating for teacher's courses
      const mongoose = require("mongoose");
      const orgObjId = mongoose.Types.ObjectId.isValid(organizationId) ? new mongoose.Types.ObjectId(organizationId) : organizationId;
      const ratings = await Rating.aggregate([
        {
          $match: {
            tenantId: orgObjId,
            courseId: { $in: courseIds },
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
          },
        },
      ]);

      return {
        organizationId,
        totalCourses: courses.length,
        totalStudents: enrollments,
        averageRating: ratings[0]?.avgRating?.toFixed(2) || 0,
        totalRatings: ratings[0]?.totalRatings || 0,
              };
    } catch (error) {
      throw new Error(`Failed to get teacher stats: ${error.message}`);
    }
  },

  /**
   * Get organization-specific data for teacher
   */
  getTeacherOrgData: async (teacherId, organizationId, dataType) => {
    try {
      const query = {
        tenantId: organizationId,
      };

      switch (dataType) {
        case "courses":
          query.createdBy = teacherId;
          return await Course.find(query).sort({ createdAt: -1 });

        case "students":
          const courses = await Course.find({ tenantId: organizationId, createdBy: teacherId });
          const courseIds = courses.map(c => c._id);
          const enrollments = await Enrollment.find({
            tenantId: organizationId,
            courseId: { $in: courseIds },
          }).populate("studentId", "firstName lastName email");
          return enrollments.map(e => e.studentId);

        case "attendance":
          query.markedBy = teacherId;
          return await Attendance.find(query)
            .populate("courseId", "title")
            .populate("studentId", "firstName lastName")
            .sort({ date: -1 });

        
        case "ratings":
          const teacherCourses = await Course.find({ tenantId: organizationId, createdBy: teacherId });
          const teacherCourseIds = teacherCourses.map(c => c._id);
          return await Rating.find({
            tenantId: organizationId,
            courseId: { $in: teacherCourseIds },
          })
            .populate("courseId", "title")
            .populate("studentId", "firstName lastName")
            .sort({ createdAt: -1 });

        case "feedback":
          const feedbackCourses = await Course.find({ tenantId: organizationId, createdBy: teacherId });
          const feedbackCourseIds = feedbackCourses.map(c => c._id);
          return await Feedback.find({
            tenantId: organizationId,
            courseId: { $in: feedbackCourseIds },
          })
            .populate("courseId", "title")
            .populate("reviewerId", "firstName lastName")
            .sort({ createdAt: -1 });

        default:
          throw new Error("Invalid data type");
      }
    } catch (error) {
      throw new Error(`Failed to get teacher data: ${error.message}`);
    }
  },
};

module.exports = teacherOrganizationService;
