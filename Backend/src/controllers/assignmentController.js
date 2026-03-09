const { Assignment, AssignmentSubmission, Course, User, Enrollment } = require("../models");

/**
 * @desc    Create new assignment
 * @route   POST /api/assignments
 * @access  Private (Teacher)
 */
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, assignmentType, maxPoints, dueDate, submissionType, instructions } = req.body;
    const teacherId = req.user.id;
    const tenantId = req.user.tenantId || req.user.tenant_id;

    // Validate course belongs to teacher
    const course = await Course.findOne({ _id: courseId, createdBy: teacherId, tenantId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to create assignments for this course",
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      courseId,
      teacherId,
      assignmentType,
      maxPoints,
      dueDate,
      submissionType,
      instructions,
      tenantId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: assignment,
      message: "Assignment created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create assignment",
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
    const tenantId = req.user.tenantId || req.user.tenant_id;
    const { courseId, status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { teacherId, tenantId, isDeleted: false };
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
    const tenantId = req.user.tenantId || req.user.tenant_id;
    const { courseId, status, page = 1, limit = 10 } = req.query;

    // Get student's enrolled courses
    const enrollments = await Enrollment.find({ studentId, status: "active" });
    const courseIds = enrollments.map(e => e.courseId);

    // Build query
    const query = { courseId: { $in: courseIds }, tenantId, isVisible: true, isDeleted: false };
    if (courseId) query.courseId = courseId;

    const assignments = await Assignment.find(query)
      .populate("courseId", "title code")
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get submission status for each assignment
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await AssignmentSubmission.find({
      assignmentId: { $in: assignmentIds },
      studentId,
    });

    // Attach submission status to assignments
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignmentId.toString() === assignment._id.toString());
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
    const tenantId = req.user.tenantId || req.user.tenant_id;

    const assignment = await Assignment.findOne({ _id: id, tenantId, isDeleted: false })
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
    const tenantId = req.user.tenantId || req.user.tenant_id;

    const assignment = await Assignment.findOne({ _id: id, teacherId, tenantId, isDeleted: false });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or you don't have permission to update it",
      });
    }

    // Check if assignment has submissions
    const hasSubmissions = await AssignmentSubmission.findOne({ assignmentId: id });
    if (hasSubmissions) {
      // Only allow certain fields to be updated if there are submissions
      const allowedUpdates = ["isVisible", "instructions", "tags"];
      const updates = {};
      allowedUpdates.forEach(field => {
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
    const tenantId = req.user.tenantId || req.user.tenant_id;

    const assignment = await Assignment.findOne({ _id: id, teacherId, tenantId, isDeleted: false });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or you don't have permission to delete it",
      });
    }

    // Check if assignment has submissions
    const hasSubmissions = await AssignmentSubmission.findOne({ assignmentId: id });
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
    const tenantId = req.user.tenantId || req.user.tenant_id;
    const { submissionType, textContent, fileSubmissions, linkSubmissions, studentNotes } = req.body;

    const assignment = await Assignment.findOne({ _id: id, tenantId, isVisible: true, isDeleted: false });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

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
        message: "Assignment submission is overdue and late submissions are not allowed",
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
        { new: true }
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

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate("assignmentId");

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
    const tenantId = req.user.tenantId || req.user.tenant_id;
    const { status, page = 1, limit = 10 } = req.query;

    // Verify assignment belongs to teacher
    const assignment = await Assignment.findOne({ _id: id, teacherId, tenantId, isDeleted: false });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or you don't have permission to view submissions",
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
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get submissions",
    });
  }
};
