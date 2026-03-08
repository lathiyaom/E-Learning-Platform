const { Holiday } = require("../models");

const holidayController = {
  /**
   * Create holiday
   * POST /Holiday/create
   */
  createHoliday: async (req, res) => {
    try {
      const { title, description, date, endDate, type, isRecurring, color } = req.body;
      const userType = req.user.userType;
      const tenantId = type === "platform" ? null : req.user.tenantId;
      const createdBy = req.user.tenantId;

      // Only admin/superadmin can create holidays
      if (!["admin", "superadmin"].includes(userType)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to create holiday",
        });
      }

      // Validate required fields
      if (!title || !date) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: title, date",
        });
      }

      const holiday = await Holiday.create({
        tenantId,
        title,
        description,
        date,
        endDate,
        type: type || "organization",
        isRecurring,
        color,
        createdBy,
      });

      res.status(201).json({
        success: true,
        message: "Holiday created successfully",
        data: holiday,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get all holidays (platform + organization)
   * GET /Holiday/all
   */
  getAllHolidays: async (req, res) => {
    try {
      const { page = 1, limit = 10, type, year } = req.query;
      const tenantId = req.user.tenantId;

      const query = {
        $or: [
          { tenantId: null }, // Platform holidays
          { tenantId }, // Organization holidays
        ],
      };

      if (type) query.type = type;

      if (year) {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        query.date = { $gte: startOfYear, $lte: endOfYear };
      }

      const total = await Holiday.countDocuments(query);
      const skip = (page - 1) * limit;

      const holidays = await Holiday.find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        message: "Holidays retrieved successfully",
        data: holidays,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get upcoming holidays
   * GET /Holiday/upcoming
   */
  getUpcomingHolidays: async (req, res) => {
    try {
      const { days = 90, page = 1, limit = 10 } = req.query;
      const tenantId = req.user.tenantId;

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(days));

      const query = {
        $or: [
          { tenantId: null },
          { tenantId },
        ],
        date: { $gte: startDate, $lte: endDate },
      };

      const total = await Holiday.countDocuments(query);
      const skip = (page - 1) * limit;

      const holidays = await Holiday.find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        message: "Upcoming holidays retrieved successfully",
        data: holidays,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get holiday by ID
   * GET /Holiday/:id
   */
  getHolidayById: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;

      const holiday = await Holiday.findOne({
        _id: id,
        $or: [
          { tenantId: null },
          { tenantId },
        ],
      });

      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Holiday retrieved successfully",
        data: holiday,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update holiday
   * PATCH /Holiday/update/:id
   */
  updateHoliday: async (req, res) => {
    try {
      const { id } = req.params;
      const userType = req.user.userType;
      const tenantId = req.user.tenantId;

      // Only admin/superadmin can update
      if (!["admin", "superadmin"].includes(userType)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const holiday = await Holiday.findOne({
        _id: id,
        $or: [
          { tenantId: null },
          { tenantId },
        ],
      });

      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found",
        });
      }

      const allowedFields = ["title", "description", "date", "endDate", "type", "isRecurring", "color"];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const updatedHoliday = await Holiday.findByIdAndUpdate(id, updates, { new: true });

      res.status(200).json({
        success: true,
        message: "Holiday updated successfully",
        data: updatedHoliday,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Delete holiday
   * DELETE /Holiday/delete/:id
   */
  deleteHoliday: async (req, res) => {
    try {
      const { id } = req.params;
      const userType = req.user.userType;
      const tenantId = req.user.tenantId;

      // Only admin/superadmin can delete
      if (!["admin", "superadmin"].includes(userType)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const holiday = await Holiday.findOneAndDelete({
        _id: id,
        $or: [
          { tenantId: null },
          { tenantId },
        ],
      });

      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Holiday deleted successfully",
        data: holiday,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get calendar holidays by year/month
   * GET /Holiday/calendar/:year/:month
   */
  getCalendarHolidays: async (req, res) => {
    try {
      const { year, month } = req.params;
      const tenantId = req.user.tenantId;

      // Validate year and month
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          message: "Invalid year or month",
        });
      }

      // Get start and end dates for the month
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

      const query = {
        $or: [
          { tenantId: null }, // Platform holidays
          { tenantId }, // Organization holidays
        ],
        date: { $gte: startDate, $lte: endDate },
      };

      const holidays = await Holiday.find(query).sort({ date: 1 });

      res.status(200).json({
        success: true,
        message: "Calendar holidays retrieved successfully",
        data: holidays,
        meta: {
          year: yearNum,
          month: monthNum,
          count: holidays.length,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = holidayController;
