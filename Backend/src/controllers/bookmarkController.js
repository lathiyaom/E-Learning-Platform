const bookmarkService = require("../services/bookmarkService");

const addBookmark = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
        success: false,
      });
    }

    const bookmark = await bookmarkService.addBookmark(userId, courseId);

    return res.status(201).json({
      message: "Course bookmarked successfully",
      success: true,
      data: bookmark,
    });
  } catch (error) {
    console.error("Error adding bookmark:", error.message);
    const status =
      error.message.includes("already bookmarked") ||
      error.message.includes("Course not found")
        ? 400
        : 500;

    return res.status(status).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
        success: false,
      });
    }

    await bookmarkService.removeBookmark(userId, courseId);

    return res.status(200).json({
      message: "Bookmark removed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error removing bookmark:", error.message);
    return res.status(error.message === "Bookmark not found" ? 404 : 500).json({
      message: error.message,
      success: false,
    });
  }
};

const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const bookmarks = await bookmarkService.getUserBookmarks(userId);

    return res.status(200).json({
      message: "Bookmarks retrieved successfully",
      success: true,
      data: bookmarks,
      count: bookmarks.length,
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error.message);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const isBookmarked = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const bookmarked = await bookmarkService.isBookmarked(userId, courseId);

    return res.status(200).json({
      success: true,
      isBookmarked: bookmarked,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  isBookmarked,
};
