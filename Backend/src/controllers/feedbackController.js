const feedbackService = require("../services/feedbackService");

const createFeedback = async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      reviewerId: req.user.id,
    };

    const feedback = await feedbackService.createFeedback(req.tenantId, feedbackData);

    return res.status(201).json({
      message: "Feedback submitted successfully",
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const getCourseFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;

    const feedbacks = await feedbackService.getCourseFeedback(req.tenantId, courseId);

    return res.status(200).json({
      message: "Course feedback retrieved successfully",
      success: true,
      data: feedbacks,
      count: feedbacks.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getUserFeedback = async (req, res) => {
  try {
    const { reviewerId } = req.params;

    // Students can only view their own feedback
    if (req.user.userType === "student" && req.user.id !== reviewerId) {
      return res.status(403).json({
        message: "You can only view your own feedback",
        success: false,
      });
    }

    const tenantScopeForQuery = req.user.userType === "student" ? null : req.tenantId;
    const feedbacks = await feedbackService.getUserFeedback(tenantScopeForQuery, reviewerId);

    return res.status(200).json({
      message: "User feedback retrieved successfully",
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await feedbackService.updateFeedback(id, req.tenantId, req.body);

    return res.status(200).json({
      message: "Feedback updated successfully",
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await feedbackService.deleteFeedback(id, req.tenantId);

    return res.status(200).json({
      message: "Feedback deleted successfully",
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  createFeedback,
  getCourseFeedback,
  getUserFeedback,
  updateFeedback,
  deleteFeedback,
};
