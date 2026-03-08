const Feedback = require("../models/Feedback.mongoose");
const { Course } = require("../models");

const createFeedback = async (tenantId, feedbackData) => {
  const { courseId, reviewerId, rating, comment, subject, isAnonymous } = feedbackData;

  if (!courseId || !reviewerId || !rating) {
    throw new Error("Course ID, Reviewer ID, and Rating are required");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Verify course exists across platform and resolve its tenant context
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }
  const resolvedTenantId = course.tenantId || course.organization_id || tenantId;
  if (!resolvedTenantId) {
    throw new Error("Course tenant context not found");
  }

  // Check if user already gave feedback
  const existing = await Feedback.findOne({ tenantId: resolvedTenantId, courseId, reviewerId });
  if (existing) {
    throw new Error("You have already submitted feedback for this course");
  }

  const feedback = await Feedback.create({
    tenantId: resolvedTenantId,
    courseId,
    reviewerId,
    rating,
    comment,
    subject: subject || "course",
    isAnonymous: isAnonymous || false,
  });

  // Update course rating
  await updateCourseRating(courseId, resolvedTenantId);

  return feedback;
};

const updateCourseRating = async (courseId, tenantId) => {
  const feedbacks = await Feedback.find({ courseId, tenantId, status: "approved" });
  
  if (feedbacks.length === 0) return;

  const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
  const avgRating = (totalRating / feedbacks.length).toFixed(1);

  await Course.findByIdAndUpdate(courseId, {
    rating: avgRating,
    reviewCount: feedbacks.length,
  });
};

const getCourseFeedback = async (tenantId, courseId) => {
  if (!tenantId || !courseId) {
    throw new Error("Tenant ID and Course ID are required");
  }

  const feedbacks = await Feedback.find({ tenantId, courseId, status: "approved" })
    .populate("reviewerId", "firstName lastName")
    .sort({ createdAt: -1 });

  return feedbacks;
};

const getUserFeedback = async (tenantId, reviewerId) => {
  if (!reviewerId) {
    throw new Error("Reviewer ID is required");
  }

  const query = { reviewerId };
  if (tenantId) query.tenantId = tenantId;

  const feedbacks = await Feedback.find(query)
    .populate("courseId", "title")
    .sort({ createdAt: -1 });

  return feedbacks;
};

const updateFeedback = async (feedbackId, tenantId, updateData) => {
  if (!feedbackId || !tenantId) {
    throw new Error("Feedback ID and Tenant ID are required");
  }

  const feedback = await Feedback.findOne({ _id: feedbackId, tenantId });
  if (!feedback) {
    throw new Error("Feedback not found");
  }

  const allowedFields = ["rating", "comment", "status"];
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      feedback[field] = updateData[field];
    }
  });

  await feedback.save();

  // Recalculate course rating
  await updateCourseRating(feedback.courseId, tenantId);

  return feedback;
};

const deleteFeedback = async (feedbackId, tenantId) => {
  if (!feedbackId || !tenantId) {
    throw new Error("Feedback ID and Tenant ID are required");
  }

  const feedback = await Feedback.findOne({ _id: feedbackId, tenantId });
  if (!feedback) {
    throw new Error("Feedback not found");
  }

  const courseId = feedback.courseId;
  await feedback.deleteOne();

  // Recalculate course rating
  await updateCourseRating(courseId, tenantId);

  return feedback;
};

module.exports = {
  createFeedback,
  getCourseFeedback,
  getUserFeedback,
  updateFeedback,
  deleteFeedback,
};
