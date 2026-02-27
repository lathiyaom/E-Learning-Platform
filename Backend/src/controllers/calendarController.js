const calendarService = require("../services/calendarService");

const calendarController = {
  /**
   * Get month calendar
   * GET /Calendar/month/:year/:month
   */
  getMonthCalendar: async (req, res) => {
    try {
      const { year, month } = req.params;
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          message: "Invalid year or month",
        });
      }

      const calendarData = await calendarService.getMonthCalendar(
        tenantId,
        userId,
        userType,
        parseInt(year),
        parseInt(month)
      );

      res.status(200).json({
        success: true,
        message: "Month calendar retrieved successfully",
        data: calendarData,
        meta: {
          year: parseInt(year),
          month: parseInt(month),
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
   * Get week calendar
   * GET /Calendar/week
   */
  getWeekCalendar: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      const calendarData = await calendarService.getWeekCalendar(tenantId, userId, userType);

      res.status(200).json({
        success: true,
        message: "Week calendar retrieved successfully",
        data: calendarData,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get today's calendar
   * GET /Calendar/today
   */
  getTodayCalendar: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const monthData = await calendarService.getMonthCalendar(tenantId, userId, userType, year, month);
      const todayKey = today.toISOString().split("T")[0];
      const todayData = monthData[todayKey] || {
        timetable: [],
        lectures: [],
        exams: [],
        events: [],
        holidays: [],
      };

      res.status(200).json({
        success: true,
        message: "Today's calendar retrieved successfully",
        data: todayData,
        meta: {
          date: todayKey,
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
   * Get upcoming events
   * GET /Calendar/upcoming/:days
   */
  getUpcomingCalendar: async (req, res) => {
    try {
      const { days = 30 } = req.params;
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      const now = new Date();
      const startDate = now;
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + parseInt(days));

      const year = startDate.getFullYear();
      const month = startDate.getMonth() + 1;

      const calendarData = await calendarService.getMonthCalendar(tenantId, userId, userType, year, month);

      // Filter to only include upcoming dates
      const upcomingData = {};
      Object.keys(calendarData).forEach((dateKey) => {
        const dateObj = new Date(dateKey);
        if (dateObj >= startDate && dateObj <= endDate) {
          if (
            calendarData[dateKey].timetable.length > 0 ||
            calendarData[dateKey].lectures.length > 0 ||
            calendarData[dateKey].exams.length > 0 ||
            calendarData[dateKey].events.length > 0 ||
            calendarData[dateKey].holidays.length > 0
          ) {
            upcomingData[dateKey] = calendarData[dateKey];
          }
        }
      });

      res.status(200).json({
        success: true,
        message: `Upcoming events for next ${days} days retrieved successfully`,
        data: upcomingData,
        meta: {
          days: parseInt(days),
          startDate,
          endDate,
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

module.exports = calendarController;
