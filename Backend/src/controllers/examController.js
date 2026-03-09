const examService = require("../services/examService");

const createExam = async (req, res) => {
  try {
    const examData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const exam = await examService.createExam(req.tenantId, examData);

    return res.status(201).json({
      message: "Exam created successfully",
      success: true,
      data: exam,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await examService.getExamById(id, req.tenantId);

    return res.status(200).json({
      message: "Exam retrieved successfully",
      success: true,
      data: exam,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
      success: false,
    });
  }
};

const getExamsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const exams = await examService.getExamsByCourse(req.tenantId, courseId);

    return res.status(200).json({
      message: "Exams retrieved successfully",
      success: true,
      data: exams,
      count: exams.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await examService.updateExam(id, req.tenantId, req.body);

    return res.status(200).json({
      message: "Exam updated successfully",
      success: true,
      data: exam,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await examService.deleteExam(id, req.tenantId);

    return res.status(200).json({
      message: "Exam deleted successfully",
      success: true,
      data: exam,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        message: "answers array is required",
        success: false,
      });
    }

    const submission = await examService.submitExam(
      req.tenantId,
      examId,
      req.user.id,
      answers
    );

    return res.status(201).json({
      message: "Exam submitted successfully",
      success: true,
      data: submission,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { gradedAnswers, feedback } = req.body;

    if (!gradedAnswers || !Array.isArray(gradedAnswers)) {
      return res.status(400).json({
        message: "gradedAnswers array is required",
        success: false,
      });
    }

    const submission = await examService.gradeSubmission(
      submissionId,
      req.tenantId,
      req.user.id,
      gradedAnswers,
      feedback
    );

    return res.status(200).json({
      message: "Submission graded successfully",
      success: true,
      data: submission,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const getStudentExams = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    const exams = await examService.getStudentExams(tenantId, userId);

    return res.status(200).json({
      message: "Student exams retrieved successfully",
      success: true,
      data: exams,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.query;

    // Students can only view their own submissions
    if (req.user.userType === "student" && req.user.id !== studentId) {
      return res.status(403).json({
        message: "You can only view your own submissions",
        success: false,
      });
    }

    const submissions = await examService.getStudentSubmissions(
      req.tenantId,
      studentId,
      courseId
    );

    return res.status(200).json({
      message: "Submissions retrieved successfully",
      success: true,
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  createExam,
  getExamById,
  getExamsByCourse,
  updateExam,
  deleteExam,
  submitExam,
  gradeSubmission,
  getStudentExams,
  getStudentSubmissions,
};
