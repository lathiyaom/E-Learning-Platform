/**
 * User Repository - Data access layer for User model
 * Provides methods specific to User operations
 * Extends BaseRepository for common CRUD operations
 */

const BaseRepository = require("./BaseRepository");
const { User, Tenant, ContactUs } = require("../models");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {Object} options - include, attributes
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email, options = {}) {
    try {
      const { include = [], attributes = null } = options;
      return await this.findOne(
        { email },
        { include }
      );
    } catch (error) {
      throw new Error(`findByEmail error: ${error.message}`);
    }
  }

  /**
   * Find user by phone number
   * @param {string} phoneNo - Phone number
   * @param {Object} options
   * @returns {Promise<Object|null>}
   */
  async findByPhone(phoneNo, options = {}) {
    try {
      const { include = [] } = options;
      return await this.findOne(
        { phoneNo },
        { include }
      );
    } catch (error) {
      throw new Error(`findByPhone error: ${error.message}`);
    }
  }

  /**
   * Get users by role
   * @param {string} userType - 'student', 'teacher', 'admin'
   * @param {Object} options - include, limit, offset
   * @returns {Promise<Array>}
   */
  async findByRole(userType, options = {}) {
    try {
      const { include = [], limit = null, offset = 0 } = options;
      return await this.findAll({
        where: { userType },
        include,
        limit,
        offset,
      });
    } catch (error) {
      throw new Error(`findByRole error: ${error.message}`);
    }
  }

  /**
   * Get users by tenant
   * @param {string} tenantId - Tenant ID
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async findByTenant(tenantId, options = {}) {
    try {
      const { include = [], limit = null, offset = 0 } = options;
      return await this.findAll({
        where: { tenantId },
        include,
        limit,
        offset,
      });
    } catch (error) {
      throw new Error(`findByTenant error: ${error.message}`);
    }
  }

  /**
   * Check if user already exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    try {
      return await this.exists({ email });
    } catch (error) {
      throw new Error(`emailExists error: ${error.message}`);
    }
  }

  /**
   * Create user with validation
   * @param {Object} userData - User data to create
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      // Check if email already exists
      const emailExists = await this.emailExists(userData.email);
      if (emailExists) {
        throw new Error("Email already exists");
      }

      return await this.create(userData);
    } catch (error) {
      throw new Error(`createUser error: ${error.message}`);
    }
  }

  /**
   * Get user with profile details
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getUserProfile(userId) {
    try {
      return await this.findById(userId, {
        include: [
          {
            model: Tenant,
            as: "tenant",
            attributes: ["id", "name", "email", "description"],
          },
        ],
      });
    } catch (error) {
      throw new Error(`getUserProfile error: ${error.message}`);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, profileData) {
    try {
      const count = await this.update(profileData, { id: userId });
      if (count === 0) {
        throw new Error("User not found");
      }
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`updateProfile error: ${error.message}`);
    }
  }

  /**
   * Delete user and related data
   * @param {string} userId - User ID
   * @returns {Promise<number>} Deleted count
   */
  async deleteUserWithRelations(userId) {
    try {
      // Delete related contact messages first
      await ContactUs.destroy({ where: { userId } });
      // Delete user
      return await this.delete({ id: userId });
    } catch (error) {
      throw new Error(`deleteUserWithRelations error: ${error.message}`);
    }
  }

  /**
   * Search users by partial name or email
   * @param {string} query - Search query
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async search(query, options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;
      const { Op } = require("sequelize");

      return await this.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${query}%` } },
            { lastName: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } },
          ],
        },
        limit,
        offset,
      });
    } catch (error) {
      throw new Error(`search error: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
