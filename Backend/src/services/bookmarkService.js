const { Bookmark, Course } = require("../models");

const normalizeBookmarkCourse = (bookmark) => {
  if (!bookmark) return null;

  const course = bookmark.courseId || bookmark.Course || bookmark.course;
  return course || null;
};

const bookmarkService = {
  async addBookmark(userId, courseId) {
    if (!userId || !courseId) {
      throw new Error("User ID and Course ID are required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const existing = await Bookmark.findOne({ userId, courseId });

    if (existing) {
      throw new Error("Course already bookmarked");
    }

    const bookmark = await Bookmark.create({ userId, courseId });
    await bookmark.populate({
      path: "courseId",
      select:
        "title image description category rating reviewCount price pricing isPaid currency tags level lessons videoUrl video_url teacher_id",
    });
    return bookmark;
  },

  async removeBookmark(userId, courseId) {
    const bookmark = await Bookmark.findOne({ userId, courseId });

    if (!bookmark) {
      throw new Error("Bookmark not found");
    }

    await bookmark.deleteOne();
    return { success: true };
  },

  async getUserBookmarks(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const populated = await Bookmark.find({ userId })
      .populate({
        path: "courseId",
        select:
          "title image description category rating reviewCount price pricing isPaid currency tags level lessons videoUrl video_url teacher_id",
      })
      .sort({ createdAt: -1 });

    return populated
      .map((bookmark) => normalizeBookmarkCourse(bookmark))
      .filter(Boolean);
  },

  async isBookmarked(userId, courseId) {
    const bookmark = await Bookmark.findOne({ userId, courseId });
    return !!bookmark;
  },

  async getBookmarkCount(courseId) {
    const count = await Bookmark.countDocuments({ courseId });
    return count;
  },
};

module.exports = bookmarkService;
