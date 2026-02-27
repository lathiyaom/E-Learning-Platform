const Exam = require("../models/Exam.mongoose");
const ExamSubmission = require("../models/ExamSubmission.mongoose");

const createExam = async (tenantId, examData) => {
  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  const { courseId, title, description, startDate, endDate, totalMarks, duration, questions, createdBy } = examData;

  if (!courseId || !title || !startDate || !endDate || !totalMarks || !duration || !questions || !createdBy) {
    throw new Error("Missing required fields");
  }

  if (questions.length === 0) {
    throw new Error("Exam must have at least one question");
  }

  // Validate dates
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error("End date must be after start date");
  }

  const exam = await Exam.create({
    tenantId,
    courseId,
    title,
    description,
    startDate,
    endDate,
    totalMarks,
    duration,
    questions,
    createdBy,
  });

  return exam;
};

const getExamById = async (examId, tenantId) => {
  if (!examId || !tenantId) {
    throw new Error("Exam ID and Tenant ID are required");
  }

  const exam = await Exam.findOne({ _id: examId, tenantId })
    .populate("courseId", "title")
    .populate("createdBy", "firstName lastName");

  if (!exam) {
    throw new Error("Exam not found");
  }

  return exam;
};

const getExamsByCourse = async (tenantId, courseId) => {
  if (!tenantId || !courseId) {
    throw new Error("Tenant ID and Course ID are required");
  }

  const exams = await Exam.find({ tenantId, courseId })
    .populate("createdBy", "firstName lastName")
    .sort({ startDate: -1 });

  return exams;
};

const updateExam = async (examId, tenantId, updateData) => {
  if (!examId || !tenantId) {
    throw new Error("Exam ID and Tenant ID are required");
  }

  const exam = await Exam.findOne({ _id: examId, tenantId });
  if (!exam) {
    throw new Error("Exam not found");
  }

  // Update allowed fields
  const allowedFields = ["title", "description", "startDate", "endDate", "totalMarks", "duration", "questions", "status"];
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      exam[field] = updateData[field];
    }
  });

  await exam.save();
  return exam;
};

const deleteExam = async (examId, tenantId) => {
  if (!examId || !tenantId) {
    throw new Error("Exam ID and Tenant ID are required");
  }

  const exam = await Exam.findOne({ _id: examId, tenantId });
  if (!exam) {
    throw new Error("Exam not found");
  }

  await exam.deleteOne();
  return exam;
};

const submitExam = async (tenantId, examId, studentId, answers) => {
  if (!tenantId || !examId || !studentId || !answers) {
    throw new Error("Missing required fields");
  }

  // Check if exam exists
  const exam = await Exam.findOne({ _id: examId, tenantId });
  if (!exam) {
    throw new Error("Exam not found");
  }

  // Check if exam is published
  if (exam.status !== "published") {
    throw new Error("Exam is not available for submission");
  }

  // Check if already submitted
  const existing = await ExamSubmission.findOne({ tenantId, examId, studentId });
  if (existing) {
    throw new Error("Exam already submitted");
  }

  // Auto-grade MCQ questions
  let totalScore = 0;
  const gradedAnswers = answers.map(ans => {
    const question = exam.questions.find(q => q._id.toString() === ans.questionId);
    if (!question) {
      return { ...ans, isCorrect: false, marksAwarded: 0 };
    }

    if (question.type === "mcq") {
      const isCorrect = ans.answer === question.correctAnswer;
      const marksAwarded = isCorrect ? question.marks : 0;
      totalScore += marksAwarded;
      return { ...ans, isCorrect, marksAwarded };
    }

    // Short and essay need manual grading
    return { ...ans, isCorrect: null, marksAwarded: 0 };
  });

  const submission = await ExamSubmission.create({
    tenantId,
    examId,
    studentId,
    answers: gradedAnswers,
    totalScore,
    status: gradedAnswers.some(a => a.isCorrect === null) ? "pending_review" : "graded",
  });

  return submission;
};

const gradeSubmission = async (submissionId, tenantId, gradedBy, gradedAnswers, feedback) => {
  if (!submissionId || !tenantId || !gradedBy) {
    throw new Error("Missing required fields");
  }

  const submission = await ExamSubmission.findOne({ _id: submissionId, tenantId });
  if (!submission) {
    throw new Error("Submission not found");
  }

  // Update answers with grades
  let totalScore = 0;
  submission.answers = submission.answers.map(ans => {
    const graded = gradedAnswers.find(g => g.questionId === ans.questionId.toString());
    if (graded) {
      totalScore += graded.marksAwarded || 0;
      return { ...ans, marksAwarded: graded.marksAwarded, isCorrect: graded.isCorrect };
    }
    totalScore += ans.marksAwarded || 0;
    return ans;
  });

  submission.totalScore = totalScore;
  submission.gradedAt = new Date();
  submission.gradedBy = gradedBy;
  submission.feedback = feedback;
  submission.status = "graded";

  await submission.save();
  return submission;
};

const getStudentSubmissions = async (tenantId, studentId, courseId) => {
  if (!tenantId || !studentId) {
    throw new Error("Tenant ID and Student ID are required");
  }

  const query = { tenantId, studentId };
  
  const submissions = await ExamSubmission.find(query)
    .populate({
      path: "examId",
      populate: { path: "courseId", select: "title" },
      match: courseId ? { courseId } : {},
    })
    .sort({ submittedAt: -1 });

  return submissions.filter(s => s.examId); // Filter out null exams
};

module.exports = {
  createExam,
  getExamById,
  getExamsByCourse,
  updateExam,
  deleteExam,
  submitExam,
  gradeSubmission,
  getStudentSubmissions,
};
