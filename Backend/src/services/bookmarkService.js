const { Bookmark, Course } = require("../models");

const bookmarkService = {
  async addBookmark(userId, courseId) {
    if (!userId || !courseId) {
      throw new Error("User ID and Course ID are required");
    }

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      throw new Error("Course already bookmarked");
    }

    const bookmark = await Bookmark.create({ userId, courseId });
    return bookmark;
  },

  async removeBookmark(userId, courseId) {
    const bookmark = await Bookmark.findOne({
      where: { userId, courseId },
    });

    if (!bookmark) {
      throw new Error("Bookmark not found");
    }

    await bookmark.destroy();
    return { success: true };
  },

  async getUserBookmarks(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          attributes: [
            "id",
            "title",
            "image",
            "description",
            "category",
            "rating",
            "reviewCount",
            "priceUSD",
            "isPaid",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return bookmarks.map(b => b.Course);
  },

  async isBookmarked(userId, courseId) {
    const bookmark = await Bookmark.findOne({
      where: { userId, courseId },
    });
    return !!bookmark;
  },

  async getBookmarkCount(courseId) {
    const count = await Bookmark.count({
      where: { courseId },
    });
    return count;
  },
};

module.exports = bookmarkService;
