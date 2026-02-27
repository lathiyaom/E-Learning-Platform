const { Lecture, Timetable, Exam, Event, Holiday, Enrollment } = require("../models");

const calendarService = {
  /**
   * Get calendar data for a specific month
   */
  getMonthCalendar: async (tenantId, userId, userType, year, month) => {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const calendarData = {};

      // Get all dates for the month
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateKey = date.toISOString().split("T")[0];
        calendarData[dateKey] = {
          timetable: [],
          lectures: [],
          exams: [],
          events: [],
          holidays: [],
        };
      }

      // Build queries based on user type
      const baseQuery = { tenantId };
      let additionalQuery = {};

      if (userType === "teacher") {
        additionalQuery = { conductedBy: userId };
      } else if (userType === "student") {
        const enrollments = await Enrollment.find({ studentId: userId });
        const courseIds = enrollments.map((e) => e.courseId);
        additionalQuery = { courseId: { $in: courseIds } };
      }

      // Get lectures
      const lectures = await Lecture.find({
        ...baseQuery,
        ...additionalQuery,
        lectureDate: { $gte: startDate, $lte: endDate },
      }).populate("courseId", "title");

      lectures.forEach((lecture) => {
        const dateKey = lecture.lectureDate.toISOString().split("T")[0];
        if (calendarData[dateKey]) {
          calendarData[dateKey].lectures.push({
            id: lecture._id,
            title: lecture.title,
            course: lecture.courseId.title,
            time: `${lecture.startTime} - ${lecture.endTime}`,
            type: lecture.type,
          });
        }
      });

      // Get timetable (recurring schedule)
      const timetables = await Timetable.find({
        ...baseQuery,
        ...additionalQuery,
        isActive: true,
      }).populate("courseId", "title");

      timetables.forEach((tt) => {
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getDay()];
          if (dayName === tt.dayOfWeek) {
            const dateKey = date.toISOString().split("T")[0];
            calendarData[dateKey].timetable.push({
              id: tt._id,
              title: tt.courseId.title,
              time: `${tt.startTime} - ${tt.endTime}`,
              room: tt.room,
              type: tt.type,
            });
          }
        }
      });

      // Get exams
      const exams = await Exam.find({
        ...baseQuery,
        ...additionalQuery,
        examDate: { $gte: startDate, $lte: endDate },
      }).populate("courseId", "title");

      exams.forEach((exam) => {
        const dateKey = exam.examDate.toISOString().split("T")[0];
        if (calendarData[dateKey]) {
          calendarData[dateKey].exams.push({
            id: exam._id,
            title: `${exam.courseId.title} - ${exam.examType}`,
            time: `${exam.startTime} - ${exam.endTime}`,
            totalMarks: exam.totalMarks,
          });
        }
      });

      // Get events
      const eventQuery = {
        tenantId,
        eventDate: { $gte: startDate, $lte: endDate },
      };

      const events = await Event.find(eventQuery);

      events.forEach((event) => {
        const dateKey = event.eventDate.toISOString().split("T")[0];
        if (calendarData[dateKey]) {
          calendarData[dateKey].events.push({
            id: event._id,
            title: event.title,
            time: event.startTime,
            type: event.type,
            location: event.location,
          });
        }
      });

      // Get holidays (platform + organization)
      const holidays = await Holiday.find({
        $or: [
          { tenantId: null },
          { tenantId },
        ],
        date: { $gte: startDate, $lte: endDate },
      });

      holidays.forEach((holiday) => {
        const dateKey = holiday.date.toISOString().split("T")[0];
        if (calendarData[dateKey]) {
          calendarData[dateKey].holidays.push({
            id: holiday._id,
            title: holiday.title,
            type: holiday.type,
            duration: holiday.durationDays,
          });
        }
      });

      return calendarData;
    } catch (error) {
      throw new Error(`Failed to get month calendar: ${error.message}`);
    }
  },

  /**
   * Get week calendar
   */
  getWeekCalendar: async (tenantId, userId, userType) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const weekData = {};
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateKey = date.toISOString().split("T")[0];
        weekData[dateKey] = {
          day: days[i],
          timetable: [],
          lectures: [],
          exams: [],
          events: [],
          holidays: [],
        };
      }

      // Similar logic to getMonthCalendar but for current week only
      // ... (implementation)

      return weekData;
    } catch (error) {
      throw new Error(`Failed to get week calendar: ${error.message}`);
    }
  },

  /**
   * Check if a date is a holiday
   */
  isHoliday: async (tenantId, date) => {
    try {
      const holiday = await Holiday.findOne({
        $or: [
          { tenantId: null },
          { tenantId },
        ],
        date: {
          $gte: new Date(date).setHours(0, 0, 0, 0),
          $lt: new Date(date).setHours(23, 59, 59, 999),
        },
      });

      return !!holiday;
    } catch (error) {
      throw new Error(`Failed to check holiday: ${error.message}`);
    }
  },
};

module.exports = calendarService;
