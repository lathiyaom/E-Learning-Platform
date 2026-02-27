/**
 * Organization Service - Manages teacher assignments and organization data isolation
 */

const { User, Tenant } = require("../models");

// ✅ Get all unassigned teachers (teachers with no organizations)
const getUnassignedTeachers = async () => {
  try {
    const unassignedTeachers = await User.find(
      {
        userType: "teacher",
        organizations: { $size: 0 }, // Empty array
      },
      { password: 0 } // Exclude password
    );

    return unassignedTeachers;
  } catch (error) {
    throw new Error(`Failed to fetch unassigned teachers: ${error.message}`);
  }
};

// ✅ Get all teachers (assigned and unassigned) for organization admin
const getAllTeachersForAdmin = async (tenantId) => {
  try {
    if (!tenantId) throw new Error("Tenant ID required");

    // Get current tenant
    const tenant = await Tenant.findById(tenantId).populate("teachers", "-password");
    if (!tenant) throw new Error("Organization not found");

    // Get unassigned teachers
    const unassigned = await getUnassignedTeachers();

    return {
      assigned: tenant.teachers || [],
      unassigned,
    };
  } catch (error) {
    throw new Error(`Failed to fetch teachers: ${error.message}`);
  }
};

// ✅ Assign multiple teachers to organization
const assignTeachersToOrganization = async (tenantId, teacherIds) => {
  try {
    if (!tenantId) throw new Error("Tenant ID required");
    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      throw new Error("Teacher IDs array required");
    }

    // Get organization
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error("Organization not found");

    // Verify all teachers exist and are actually teachers
    const teachers = await User.find({
      _id: { $in: teacherIds },
      userType: "teacher",
    });

    if (teachers.length !== teacherIds.length) {
      throw new Error("Some teacher IDs are invalid or users are not teachers");
    }

    // Add teachers to organization and update their organizations array
    const session = await require("mongoose").startSession();
    session.startTransaction();

    try {
      // Add teachers to tenant
      await Tenant.findByIdAndUpdate(
        tenantId,
        { $addToSet: { teachers: { $each: teacherIds } } },
        { session }
      );

      // Add tenant to each teacher's organizations
      await User.updateMany(
        { _id: { $in: teacherIds } },
        { $addToSet: { organizations: tenantId } },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return {
      success: true,
      message: `${teacherIds.length} teacher(s) assigned to organization successfully`,
      assignedCount: teacherIds.length,
    };
  } catch (error) {
    throw new Error(`Failed to assign teachers: ${error.message}`);
  }
};

// ✅ Get teacher's organizations
const getTeacherOrganizations = async (teacherId) => {
  try {
    const teacher = await User.findById(teacherId)
      .select("firstName lastName email organizations currentOrganization")
      .populate("organizations", "name email status")
      .populate("currentOrganization", "name email status");

    if (!teacher || teacher.userType !== "teacher") {
      throw new Error("Teacher not found or user is not a teacher");
    }

    return {
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
      },
      organizations: teacher.organizations || [],
      currentOrganization: teacher.currentOrganization,
    };
  } catch (error) {
    throw new Error(`Failed to fetch teacher organizations: ${error.message}`);
  }
};

// ✅ Switch teacher's current organization
const switchTeacherOrganization = async (teacherId, organizationId) => {
  try {
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.userType !== "teacher") {
      throw new Error("Teacher not found or user is not a teacher");
    }

    // Verify teacher is assigned to this organization
    const isAssigned = teacher.organizations.includes(organizationId);
    if (!isAssigned) {
      throw new Error("Teacher is not assigned to this organization");
    }

    // Update current organization
    teacher.currentOrganization = organizationId;
    await teacher.save();

    return {
      success: true,
      message: "Organization switched successfully",
      currentOrganization: organizationId,
    };
  } catch (error) {
    throw new Error(`Failed to switch organization: ${error.message}`);
  }
};

// ✅ Remove teacher from organization
const removeTeacherFromOrganization = async (tenantId, teacherId) => {
  try {
    if (!tenantId || !teacherId) {
      throw new Error("Tenant ID and Teacher ID required");
    }

    const session = await require("mongoose").startSession();
    session.startTransaction();

    try {
      // Remove teacher from tenant
      await Tenant.findByIdAndUpdate(
        tenantId,
        { $pull: { teachers: teacherId } },
        { session }
      );

      // Remove tenant from teacher's organizations
      await User.findByIdAndUpdate(
        teacherId,
        {
          $pull: { organizations: tenantId },
          // If removing current org, clear currentOrganization
          $cond: {
            if: { $eq: ["$currentOrganization", tenantId] },
            then: { currentOrganization: null },
            else: "$$CURRENT",
          },
        },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return {
      success: true,
      message: "Teacher removed from organization successfully",
    };
  } catch (error) {
    throw new Error(`Failed to remove teacher: ${error.message}`);
  }
};

// ✅ Get organization's data with isolation (courses, students, events, etc.)
const getOrganizationDataForTeacher = async (teacherId, organizationId) => {
  try {
    const { Course, Enrollment, Event, Timetable } = require("../models");

    // Verify teacher belongs to this organization
    const teacher = await User.findById(teacherId);
    if (!teacher || !teacher.organizations.includes(organizationId)) {
      throw new Error("Teacher not assigned to this organization");
    }

    // Get isolated data for this organization
    const [courses, enrollments, events, timetable] = await Promise.all([
      Course.find({ tenantId: organizationId }).lean(),
      Enrollment.find({ tenantId: organizationId }).lean(),
      Event.find({ tenantId: organizationId }).lean(),
      Timetable.find({ tenantId: organizationId }).lean(),
    ]);

    return {
      organizationId,
      data: {
        courses,
        enrollments,
        events,
        timetable,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch organization data: ${error.message}`
    );
  }
};

module.exports = {
  getUnassignedTeachers,
  getAllTeachersForAdmin,
  assignTeachersToOrganization,
  getTeacherOrganizations,
  switchTeacherOrganization,
  removeTeacherFromOrganization,
  getOrganizationDataForTeacher,
};
