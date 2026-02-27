/**
 * Bookmark Repository - Data access layer for Bookmark model
 * Provides methods specific to Bookmark operations
 * Extends BaseRepository
 */

const BaseRepository = require("./BaseRepository");
const { Bookmark, Course, User } = require("../models");

class BookmarkRepository extends BaseRepository {
  constructor() {
    super(Bookmark);
  }

  /**
   * Add bookmark for user
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>}
   */
  async addBookmark(userId, courseId) {
    try {
      // Check if already bookmarked
      const existing = await this.findOne({
        userId,
        courseId,
      });

      if (existing) {
        throw new Error("Course already bookmarked");
      }

      return await this.create({ userId, courseId });
    } catch (error) {
      throw new Error(`addBookmark error: ${error.message}`);
    }
  }

  /**
   * Remove bookmark
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<number>} Deleted count
   */
  async removeBookmark(userId, courseId) {
    try {
      return await this.delete({ userId, courseId });
    } catch (error) {
      throw new Error(`removeBookmark error: ${error.message}`);
    }
  }

  /**
   * Get user bookmarks
   * @param {string} userId - User ID
   * @param {Object} options - include, limit, offset
   * @returns {Promise<Array>}
   */
  async getUserBookmarks(userId, options = {}) {
    try {
      const { limit = null, offset = 0 } = options;

      return await this.findAll({
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
        limit,
        offset,
      });
    } catch (error) {
      throw new Error(`getUserBookmarks error: ${error.message}`);
    }
  }

  /**
   * Check if course is bookmarked by user
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<boolean>}
   */
  async isBookmarked(userId, courseId) {
    try {
      const count = await this.count({ userId, courseId });
      return count > 0;
    } catch (error) {
      throw new Error(`isBookmarked error: ${error.message}`);
    }
  }

  /**
   * Get bookmarks count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getBookmarkCount(userId) {
    try {
      return await this.count({ userId });
    } catch (error) {
      throw new Error(`getBookmarkCount error: ${error.message}`);
    }
  }

  /**
   * Get most bookmarked courses
   * @param {number} limit - Number of courses
   * @returns {Promise<Array>}
   */
  async getMostBookmarked(limit = 10) {
    try {
      const { sequelize } = this.model;
      const { Op } = require("sequelize");

      return await this.findAll({
        attributes: {
          include: [[sequelize.fn("COUNT", sequelize.col("id")), "bookmarkCount"]],
        },
        group: ["courseId"],
        order: [[sequelize.literal("bookmarkCount"), "DESC"]],
        limit,
        raw: true,
      });
    } catch (error) {
      throw new Error(`getMostBookmarked error: ${error.message}`);
    }
  }
}

module.exports = BookmarkRepository;
