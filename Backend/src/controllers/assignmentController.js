const {
  Assignment,
  AssignmentSubmission,
  Course,
  User,
  Enrollment,
} = require("../models");

/**
 * @desc    Create new assignment
 * @route   POST /api/assignments
 * @access  Private (Teacher)
 */
exports.createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      assignmentType,
      maxPoints,
      dueDate,
      submissionType,
      instructions,
    } = req.body;
    const teacherId = req.user.id;
    // Ensure fallback to organization_id since sometimes tenantId fields vary
    const tenantId =
      req.user.tenantId || req.user.tenant_id || req.user.organization_id;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Course ID is required." });
    }
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    // Validate course belongs to teacher
    // we use an $or because some courses use teacher_id and some use createdBy
    let courseQuery = {
      _id: courseId,
    };

    const course = await Course.findOne(courseQuery);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found: " + courseId,
      });
    }

    // Attempt to extract tenant from user, or fallback to course's tenant
    const finalTenantId = tenantId || course.tenantId || course.organization_id;
    if (!finalTenantId) {
      return res.status(400).json({
        success: false,
        message: "Could not resolve a Tenant ID for this assignment.",
      });
    }

    const assignment = await Assignment.create({
      ...req.body,
      title,
      description,
      courseId,
      teacherId,
      assignmentType: assignmentType || "homework",
      maxPoints: Number(maxPoints) || 100,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to +7 days if empty
      submissionType: submissionType || "text",
      instructions: instructions || "",
      tenantId: finalTenantId,
    });

    res.status(201).json({
      success: true,
      data: assignment,
      message: "Assignment created successfully",
    });
  } catch (error) {
    console.error("Assignment creation error details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create assignment",
      errorDetails: error.toString(),
    });
  }
};

/**
 * @desc    Get all assignments for a teacher
 * @route   GET /api/assignments/teacher
 * @access  Private (Teacher)
 */
exports.getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const tenantId =
      req.user.tenantId || req.user.tenant_id || req.user.organization_id;
    const { courseId, status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {
      teacherId,
      $or: [
        { tenantId: tenantId },
        { tenantId: null },
        { organization_id: tenantId },
      ],
      isDeleted: false,
    };
    if (courseId) query.courseId = courseId;
    if (status === "published") query.isVisible = true;
    if (status === "draft") query.isVisible = false;

    const assignments = await Assignment.find(query)
      .populate("courseId", "title code")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get assignments",
    });
  }
};

/**
 * @desc    Get assignments for a student
 * @route   GET /api/assignments/student
 * @access  Private (Student)
 */
exports.getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, status, page = 1, limit = 10 } = req.query;

    // Get student's enrolled courses
    const enrollments = await Enrollment.find({ studentId, status: "active" });
    const courseIds = enrollments.map((e) => e.courseId);

    // Build query - students should see all assignments for their enrolled courses
    const query = {
      courseId: { $in: courseIds },
      isVisible: true,
      isDeleted: false,
    };
    if (courseId) query.courseId = courseId;

    if (status && status !== "all") {
      const allStudentSubmissions = await AssignmentSubmission.find({
        studentId,
      });

      const submittedAssignmentIds = allStudentSubmissions
        .filter((s) => s.status === "submitted")
        .map((s) => s.assignmentId);
      const gradedAssignmentIds = allStudentSubmissions
        .filter((s) => s.status === "graded")
        .map((s) => s.assignmentId);
      const allSubmittedIds = allStudentSubmissions.map((s) => s.assignmentId);

      const now = new Date();

      if (status === "submitted") {
        query._id = { $in: submittedAssignmentIds };
      } else if (status === "graded") {
        query._id = { $in: gradedAssignmentIds };
      } else if (status === "pending") {
        query._id = { $nin: allSubmittedIds };
        query.dueDate = { $gte: now };
      } else if (status === "overdue") {
        query._id = { $nin: allSubmittedIds };
        query.dueDate = { $lt: now };
      }
    }

    const assignments = await Assignment.find(query)
      .populate("courseId", "title code")
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get submission status for each assignment
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await AssignmentSubmission.find({
      assignmentId: { $in: assignmentIds },
      studentId,
    });

    // Attach submission status to assignments
    const assignmentsWithStatus = assignments.map((assignment) => {
      const submission = submissions.find(
        (s) => s.assignmentId.toString() === assignment._id.toString(),
      );
      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : "not_submitted",
        submissionId: submission ? submission._id : null,
        isOverdue: new Date() > assignment.dueDate && !submission,
        submittedAt: submission ? submission.submittedAt : null,
        grade: submission ? submission.grade : null,
      };
    });

    const total = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: assignmentsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get assignments",
    });
  }
};

/**
 * @desc    Get single assignment
 * @route   GET /api/assignments/:id
 * @access  Private
 */
exports.getAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.userType;

    const assignment = await Assignment.findOne({ _id: id, isDeleted: false })
      .populate("courseId", "title code description")
      .populate("teacherId", "firstName lastName email");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check permissions
    if (userRole === "teacher" && assignment.teacherId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this assignment",
      });
    }

    if (userRole === "student") {
      // Check if student is enrolled in the course
      const enrollment = await Enrollment.findOne({
        courseId: assignment.courseId._id,
        studentId: userId,
        status: "active",
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get assignment",
    });
  }
};

/**
 * @desc    Update assignment
 * @route   PUT /api/assignments/:id
 * @access  Private (Teacher)
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const tenantId =
      req.user.tenantId || req.user.tenant_id || req.user.organization_id;

    const query = {
      _id: id,
      teacherId,
      $or: [
        { tenantId: tenantId },
        { tenantId: null },
        { organization_id: tenantId },
      ],
      isDeleted: false,
    };

    const assignment = await Assignment.findOne(query);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found or you don't have permission to update it",
      });
    }

    // Check if assignment has submissions
    const hasSubmissions = await AssignmentSubmission.findOne({
      assignmentId: id,
    });
    if (hasSubmissions) {
      // Only allow certain fields to be updated if there are submissions
      const allowedUpdates = [
        "isVisible",
        "instructions",
        "tags",
        "dueDate",
        "allowLateSubmission",
        "latePenaltyPercent",
        "maxPoints",
        "title",
        "description",
      ];
      const updates = {};
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      Object.assign(assignment, updates);
    } else {
      // Allow all updates
      Object.assign(assignment, req.body);
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
      message: "Assignment updated successfully",
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update assignment",
    });
  }
};

/**
 * @desc    Delete assignment
 * @route   DELETE /api/assignments/:id
 * @access  Private (Teacher)
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const tenantId =
      req.user.tenantId || req.user.tenant_id || req.user.organization_id;

    const query = {
      _id: id,
      teacherId,
      $or: [
        { tenantId: tenantId },
        { tenantId: null },
        { organization_id: tenantId },
      ],
      isDeleted: false,
    };

    const assignment = await Assignment.findOne(query);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found or you don't have permission to delete it",
      });
    }

    // Check if assignment has submissions
    const hasSubmissions = await AssignmentSubmission.findOne({
      assignmentId: id,
    });
    if (hasSubmissions) {
      // Soft delete
      assignment.isDeleted = true;
      assignment.deletedAt = new Date();
      await assignment.save();
    } else {
      // Hard delete
      await Assignment.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete assignment",
    });
  }
};

/**
 * @desc    Submit assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Student)
 */
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const {
      submissionType,
      textContent,
      fileSubmissions,
      linkSubmissions,
      studentNotes,
    } = req.body;

    const assignment = await Assignment.findOne({
      _id: id,
      isVisible: true,
      isDeleted: false,
    });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const tenantId =
      req.tenantId ||
      assignment.tenantId ||
      req.user.tenantId ||
      req.user.tenant_id ||
      req.user.organization_id ||
      assignment.organization_id;

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      courseId: assignment.courseId,
      studentId,
      status: "active",
    });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Check if assignment is overdue
    const isOverdue = new Date() > assignment.dueDate;
    if (isOverdue && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message:
          "Assignment submission is overdue and late submissions are not allowed",
      });
    }

    // Check for existing submission
    const existingSubmission = await AssignmentSubmission.findOne({
      assignmentId: id,
      studentId,
    });

    let submission;
    if (existingSubmission) {
      // Update existing submission
      if (existingSubmission.attemptNumber >= existingSubmission.maxAttempts) {
        return res.status(400).json({
          success: false,
          message: "Maximum submission attempts reached",
        });
      }

      submission = await AssignmentSubmission.findByIdAndUpdate(
        existingSubmission._id,
        {
          submissionType,
          textContent,
          fileSubmissions,
          linkSubmissions,
          studentNotes,
          submittedAt: new Date(),
          isLate: isOverdue,
          latePenaltyApplied: isOverdue ? assignment.latePenaltyPercent : 0,
          attemptNumber: existingSubmission.attemptNumber + 1,
          status: "submitted",
        },
        { new: true },
      );
    } else {
      // Create new submission
      submission = await AssignmentSubmission.create({
        assignmentId: id,
        studentId,
        courseId: assignment.courseId,
        submissionType,
        textContent,
        fileSubmissions,
        linkSubmissions,
        studentNotes,
        maxGrade: assignment.maxPoints,
        isLate: isOverdue,
        latePenaltyApplied: isOverdue ? assignment.latePenaltyPercent : 0,
        status: "submitted",
        tenantId,
      });
    }

    res.status(201).json({
      success: true,
      data: submission,
      message: "Assignment submitted successfully",
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit assignment",
    });
  }
};

/**
 * @desc    Grade assignment submission
 * @route   PUT /api/assignments/:submissionId/grade
 * @access  Private (Teacher)
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const teacherId = req.user.id;
    const tenantId = req.user.tenantId || req.user.tenant_id;
    const { grade, teacherFeedback, rubricScores } = req.body;

    const submission =
      await AssignmentSubmission.findById(submissionId).populate(
        "assignmentId",
      );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check if teacher owns the assignment
    if (submission.assignmentId.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to grade this submission",
      });
    }

    submission.grade = grade;
    submission.teacherFeedback = teacherFeedback;
    submission.teacherId = teacherId;
    submission.gradedAt = new Date();
    submission.status = "graded";

    if (rubricScores) {
      submission.rubricScores = rubricScores;
    }

    await submission.save();

    res.status(200).json({
      success: true,
      data: submission,
      message: "Submission graded successfully",
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to grade submission",
    });
  }
};

/**
 * @desc    Get assignment submissions
 * @route   GET /api/assignments/:id/submissions
 * @access  Private (Teacher)
 */
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const tenantId =
      req.user.tenantId || req.user.tenant_id || req.user.organization_id;
    const { status, page = 1, limit = 10 } = req.query;

    const queryAssig = {
      _id: id,
      teacherId,
      $or: [
        { tenantId: tenantId },
        { tenantId: null },
        { organization_id: tenantId },
      ],
      isDeleted: false,
    };

    // Verify assignment belongs to teacher
    const assignment = await Assignment.findOne(queryAssig);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found or you don't have permission to view submissions",
      });
    }

    // Build query
    const query = { assignmentId: id };
    if (status) query.status = status;

    const submissions = await AssignmentSubmission.find(query)
      .populate("studentId", "firstName lastName email")
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AssignmentSubmission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get submissions",
    });
  }
};
