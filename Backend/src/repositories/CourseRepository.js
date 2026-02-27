/**
 * Course Repository - Data access layer for Course model
 * Provides methods specific to Course operations
 * Extends BaseRepository for common CRUD operations
 */

const BaseRepository = require("./BaseRepository");
const { Course, User } = require("../models");
const { Op } = require("sequelize");

class CourseRepository extends BaseRepository {
  constructor() {
    super(Course);
  }

  /**
   * Get all courses with sorting options
   * @param {string} sortBy - Sorting option: rating, popular, newest, oldest, price_low_to_high, price_high_to_low
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>}
   */
  async getCoursesWithSort(sortBy = "rating", filters = {}) {
    try {
      let order = [["rating", "DESC"]]; // Default

      switch (sortBy) {
        case "popular":
          order = [["reviewCount", "DESC"]];
          break;
        case "price_low_to_high":
          order = [["priceUSD", "ASC"]];
          break;
        case "price_high_to_low":
          order = [["priceUSD", "DESC"]];
          break;
        case "rating":
          order = [["rating", "DESC"]];
          break;
        case "newest":
          order = [["createdAt", "DESC"]];
          break;
        case "oldest":
          order = [["createdAt", "ASC"]];
          break;
        case "most_reviewed":
          order = [["reviewCount", "DESC"]];
          break;
        default:
          order = [["rating", "DESC"]];
      }

      return await this.findAll({
        where: filters,
        order,
      });
    } catch (error) {
      throw new Error(`getCoursesWithSort error: ${error.message}`);
    }
  }

  /**
   * Get courses by category
   * @param {string} category - Course category
   * @param {Object} options - include, limit, offset
   * @returns {Promise<Array>}
   */
  async findByCategory(category, options = {}) {
    try {
      const { include = [], limit = null, offset = 0 } = options;
      return await this.findAll({
        where: { category },
        include,
        limit,
        offset,
      });
    } catch (error) {
      throw new Error(`findByCategory error: ${error.message}`);
    }
  }

  /**
   * Search courses by title or description
   * @param {string} query - Search query
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async search(query, options = {}) {
    try {
      const { limit = 10, offset = 0, category = null } = options;

      const where = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      };

      if (category) {
        where.category = category;
      }

      return await this.findAll({
        where,
        limit,
        offset,
      });
    } catch (error) {
      throw new Error(`search error: ${error.message}`);
    }
  }

  /**
   * Get paid courses only
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getPaidCourses(options = {}) {
    try {
      const { limit = null, offset = 0, sortBy = "rating" } = options;
      return await this.getCoursesWithSort(sortBy, { isPaid: true });
    } catch (error) {
      throw new Error(`getPaidCourses error: ${error.message}`);
    }
  }

  /**
   * Get free courses only
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getFreeCourses(options = {}) {
    try {
      const { limit = null, offset = 0, sortBy = "rating" } = options;
      return await this.getCoursesWithSort(sortBy, { isPaid: false });
    } catch (error) {
      throw new Error(`getFreeCourses error: ${error.message}`);
    }
  }

  /**
   * Get top rated courses
   * @param {number} limit - Number of courses to return
   * @returns {Promise<Array>}
   */
  async getTopRated(limit = 10) {
    try {
      return await this.findAll({
        order: [["rating", "DESC"]],
        limit,
      });
    } catch (error) {
      throw new Error(`getTopRated error: ${error.message}`);
    }
  }

  /**
   * Get newest courses
   * @param {number} limit - Number of courses to return
   * @returns {Promise<Array>}
   */
  async getNewest(limit = 10) {
    try {
      return await this.findAll({
        order: [["createdAt", "DESC"]],
        limit,
      });
    } catch (error) {
      throw new Error(`getNewest error: ${error.message}`);
    }
  }

  /**
   * Get popular courses
   * @param {number} limit - Number of courses to return
   * @returns {Promise<Array>}
   */
  async getPopular(limit = 10) {
    try {
      return await this.findAll({
        order: [["reviewCount", "DESC"]],
        limit,
      });
    } catch (error) {
      throw new Error(`getPopular error: ${error.message}`);
    }
  }

  /**
   * Create course with validation
   * @param {Object} courseData - Course data
   * @returns {Promise<Object>} Created course
   */
  async createCourse(courseData) {
    try {
      // Validate price for paid courses
      if (courseData.isPaid && courseData.priceUSD <= 0) {
        throw new Error("Price must be greater than 0 for paid courses");
      }

      return await this.create(courseData);
    } catch (error) {
      throw new Error(`createCourse error: ${error.message}`);
    }
  }

  /**
   * Update course rating
   * @param {string} courseId - Course ID
   * @param {number} newRating - New rating value
   * @returns {Promise<Object>} Updated course
   */
  async updateRating(courseId, newRating) {
    try {
      if (newRating < 0 || newRating > 5) {
        throw new Error("Rating must be between 0 and 5");
      }

      await this.update(
        { rating: newRating },
        { id: courseId }
      );

      return await this.findById(courseId);
    } catch (error) {
      throw new Error(`updateRating error: ${error.message}`);
    }
  }

  /**
   * Increment review count
   * @param {string} courseId - Course ID
   * @returns {Promise<number>} New review count
   */
  async incrementReviewCount(courseId) {
    try {
      const course = await this.findById(courseId);
      if (!course) throw new Error("Course not found");

      await this.update(
        { reviewCount: course.reviewCount + 1 },
        { id: courseId }
      );

      return course.reviewCount + 1;
    } catch (error) {
      throw new Error(`incrementReviewCount error: ${error.message}`);
    }
  }

  /**
   * Get courses by tags
   * @param {Array} tags - Tags to search
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async findByTags(tags, options = {}) {
    try {
      const { limit = null, offset = 0 } = options;
      
      return await this.findAll({
        where: {
          tags: {
            [Op.overlap]: tags,
          },
        },
        limit,
        offset,
      });
    } catch (error) {
      throw new Error(`findByTags error: ${error.message}`);
    }
  }
}

module.exports = CourseRepository;
