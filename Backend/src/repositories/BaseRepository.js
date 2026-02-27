/**
 * Base Repository - Provides abstract data access patterns
 * Implements Repository Design Pattern for data layer abstraction
 * Promotes SOLID principles: Single Responsibility, Dependency Injection
 */

class BaseRepository {
  /**
   * Constructor - accepts a Sequelize model
   * @param {Object} model - Sequelize model instance
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all records with optional filters and pagination
   * @param {Object} options - { where, include, limit, offset, order }
   * @returns {Promise<Array>} Array of records
   */
  async findAll(options = {}) {
    try {
      const {
        where = {},
        include = [],
        limit = null,
        offset = 0,
        order = [],
      } = options;

      return await this.model.findAll({
        where,
        include,
        limit,
        offset,
        order,
      });
    } catch (error) {
      throw new Error(`findAll error: ${error.message}`);
    }
  }

  /**
   * Find record by primary key
   * @param {*} id - Primary key value
   * @param {Object} options - { include }
   * @returns {Promise<Object|null>} Record or null
   */
  async findById(id, options = {}) {
    try {
      const { include = [] } = options;

      return await this.model.findByPk(id, { include });
    } catch (error) {
      throw new Error(`findById error: ${error.message}`);
    }
  }

  /**
   * Find single record by conditions
   * @param {Object} where - Filter conditions
   * @param {Object} options - { include }
   * @returns {Promise<Object|null>} Record or null
   */
  async findOne(where, options = {}) {
    try {
      const { include = [] } = options;

      return await this.model.findOne({ where, include });
    } catch (error) {
      throw new Error(`findOne error: ${error.message}`);
    }
  }

  /**
   * Create new record
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new Error(`create error: ${error.message}`);
    }
  }

  /**
   * Update record(s) by condition
   * @param {Object} data - Fields to update
   * @param {Object} where - Filter conditions
   * @returns {Promise<number>} Count of updated records
   */
  async update(data, where) {
    try {
      const [count] = await this.model.update(data, { where });
      return count;
    } catch (error) {
      throw new Error(`update error: ${error.message}`);
    }
  }

  /**
   * Delete record(s) by condition
   * @param {Object} where - Filter conditions
   * @returns {Promise<number>} Count of deleted records
   */
  async delete(where) {
    try {
      return await this.model.destroy({ where });
    } catch (error) {
      throw new Error(`delete error: ${error.message}`);
    }
  }

  /**
   * Count records matching conditions
   * @param {Object} where - Filter conditions
   * @returns {Promise<number>} Count
   */
  async count(where = {}) {
    try {
      return await this.model.count({ where });
    } catch (error) {
      throw new Error(`count error: ${error.message}`);
    }
  }

  /**
   * Find and paginate
   * @param {Object} options - { where, limit, offset, order, include }
   * @returns {Promise<Object>} { rows, total, page, totalPages }
   */
  async paginate(options = {}) {
    try {
      const {
        where = {},
        limit = 10,
        offset = 0,
        order = [],
        include = [],
      } = options;

      const { count, rows } = await this.model.findAndCountAll({
        where,
        limit,
        offset,
        order,
        include,
      });

      const page = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(count / limit);

      return {
        rows,
        total: count,
        page,
        totalPages,
        hasMore: page < totalPages,
      };
    } catch (error) {
      throw new Error(`paginate error: ${error.message}`);
    }
  }

  /**
   * Bulk create records
   * @param {Array} data - Array of records to create
   * @returns {Promise<Array>} Created records
   */
  async bulkCreate(data) {
    try {
      return await this.model.bulkCreate(data);
    } catch (error) {
      throw new Error(`bulkCreate error: ${error.message}`);
    }
  }

  /**
   * Check existence by condition
   * @param {Object} where - Filter conditions
   * @returns {Promise<boolean>} Exists or not
   */
  async exists(where) {
    try {
      const count = await this.model.count({ where });
      return count > 0;
    } catch (error) {
      throw new Error(`exists error: ${error.message}`);
    }
  }

  /**
   * Raw queries - Be careful with SQL injection
   * @param {string} sql - SQL query
   * @param {Object} options - sequelize options
   * @returns {Promise<Array>} Query result
   */
  async query(sql, options = {}) {
    try {
      const sequelize = this.model.sequelize;
      return await sequelize.query(sql, options);
    } catch (error) {
      throw new Error(`query error: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;
